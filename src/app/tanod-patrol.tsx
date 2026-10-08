import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

type AssignedRoute = {
  id: string;
  route_id: string | null;
  assigned_date: string;
  status: string;
  patrol_routes: {
    route_name: string;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
    route_points?: {
      latitude: number;
      longitude: number;
    }[] | null;
  } | null;
};

export default function TanodPatrol() {
  const [patrolling, setPatrolling] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);

  const [assignedRoute, setAssignedRoute] =
    useState<AssignedRoute | null>(null);

  const locationSubscription =
    useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    initializePatrol();

    return () => {
      locationSubscription.current?.remove();
      locationSubscription.current = null;
    };
  }, []);

  const initializePatrol = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date()
        .toISOString()
        .split('T')[0];

      const { data: routeData, error: routeError } =
        await supabase
          .from('patrol_assignments')
          .select(`
            id,
            route_id,
            assigned_date,
            status,
            patrol_routes (
              route_name,
              description,
              latitude,
              longitude,
              route_points
            )
          `)
          .eq('tanod_id', user.id)
          .eq('assigned_date', today)
          .eq('status', 'assigned')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

      if (routeError) {
        Alert.alert('Error', routeError.message);
        setLoading(false);
        return;
      }

      setAssignedRoute(
        routeData as AssignedRoute | null
      );

      const { data: activeSession, error: sessionError } =
        await supabase
          .from('patrol_sessions')
          .select('id, route_id, start_time')
          .eq('tanod_id', user.id)
          .eq('status', 'active')
          .order('start_time', {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

      if (sessionError) {
        Alert.alert(
          'Error',
          sessionError.message
        );
        setLoading(false);
        return;
      }

      if (activeSession) {
        setSessionId(activeSession.id);
        setPatrolling(true);

        await startLocationTracking(
          activeSession.id
        );
      } else {
        setSessionId(null);
        setPatrolling(false);
      }
    } catch (error) {
      console.log(
        'PATROL INITIALIZE ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Something went wrong while loading patrol.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedRoute = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date()
        .toISOString()
        .split('T')[0];

      const { data, error } = await supabase
        .from('patrol_assignments')
        .select(`
          id,
          route_id,
          assigned_date,
          status,
          patrol_routes (
            route_name,
            description,
            latitude,
            longitude,
            route_points
          )
        `)
        .eq('tanod_id', user.id)
        .eq('assigned_date', today)
        .eq('status', 'assigned')
        .order('created_at', {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      setAssignedRoute(
        data as AssignedRoute | null
      );

      const { data: activeSession } =
        await supabase
          .from('patrol_sessions')
          .select('id')
          .eq('tanod_id', user.id)
          .eq('status', 'active')
          .order('start_time', {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

      if (activeSession) {
        setSessionId(activeSession.id);
        setPatrolling(true);

        await startLocationTracking(
          activeSession.id
        );
      } else {
        setSessionId(null);
        setPatrolling(false);
      }
    } catch (error) {
      console.log(
        'LOAD PATROL ERROR:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = async (
    activeSessionId: string
  ) => {
    locationSubscription.current?.remove();
    locationSubscription.current = null;

    const {
      status,
    } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Location Required',
        'Please allow location access to track your patrol.'
      );
      return;
    }

    try {
      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const currentLat =
        location.coords.latitude;

      const currentLng =
        location.coords.longitude;

      setLatitude(currentLat);
      setLongitude(currentLng);

      const { error: initialLocationError } =
        await supabase
          .from('patrol_locations')
          .insert({
            patrol_session_id: activeSessionId,
            latitude: currentLat,
            longitude: currentLng,
          });

      if (initialLocationError) {
        console.log(
          'Initial GPS save error:',
          initialLocationError.message
        );
      }

      locationSubscription.current =
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 10,
          },
          async (newLocation) => {
            const lat =
              newLocation.coords.latitude;

            const lng =
              newLocation.coords.longitude;

            setLatitude(lat);
            setLongitude(lng);

            const { error } =
              await supabase
                .from('patrol_locations')
                .insert({
                  patrol_session_id:
                    activeSessionId,
                  latitude: lat,
                  longitude: lng,
                });

            if (error) {
              console.log(
                'GPS save error:',
                error.message
              );
            }
          }
        );
    } catch (error) {
      console.log(
        'LOCATION TRACKING ERROR:',
        error
      );
    }
  };

  const startPatrol = async () => {
    if (!assignedRoute) {
      Alert.alert(
        'No Assigned Route',
        'You do not have a patrol route assigned for today.'
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const {
        data: existingSession,
        error: existingError,
      } = await supabase
        .from('patrol_sessions')
        .select('id')
        .eq('tanod_id', user.id)
        .eq('status', 'active')
        .order('start_time', {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (existingError) {
        Alert.alert(
          'Error',
          existingError.message
        );
        setLoading(false);
        return;
      }

      if (existingSession) {
        setSessionId(existingSession.id);
        setPatrolling(true);

        await startLocationTracking(
          existingSession.id
        );

        setLoading(false);

        Alert.alert(
          'Patrol Resumed',
          'Your existing patrol session is still active.'
        );

        return;
      }

      const {
        status: locationStatus,
      } =
        await Location.requestForegroundPermissionsAsync();

      if (locationStatus !== 'granted') {
        setLoading(false);

        Alert.alert(
          'Location Required',
          'Please allow location access to start patrol.'
        );

        return;
      }

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const currentLat =
        location.coords.latitude;

      const currentLng =
        location.coords.longitude;

      setLatitude(currentLat);
      setLongitude(currentLng);

      const { data, error } = await supabase
        .from('patrol_sessions')
        .insert({
          tanod_id: user.id,
          route_id: assignedRoute.route_id,
          start_time: new Date().toISOString(),
          status: 'active',
        })
        .select('id')
        .single();

      if (error) {
        Alert.alert(
          'Error',
          error.message
        );
        setLoading(false);
        return;
      }

      setSessionId(data.id);
      setPatrolling(true);

      await supabase
        .from('patrol_locations')
        .insert({
          patrol_session_id: data.id,
          latitude: currentLat,
          longitude: currentLng,
        });

      await startLocationTracking(data.id);

      Alert.alert(
        'Patrol Started',
        `You are now patrolling ${
          assignedRoute.patrol_routes?.route_name ||
          'your assigned route'
        }.`
      );
    } catch (error) {
      console.log(
        'START PATROL ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Something went wrong while starting patrol.'
      );
    } finally {
      setLoading(false);
    }
  };

  const endPatrol = async () => {
    if (!sessionId) {
      return;
    }

    setLoading(true);

    try {
      locationSubscription.current?.remove();
      locationSubscription.current = null;

      const { error } = await supabase
        .from('patrol_sessions')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed',
        })
        .eq('id', sessionId)
        .eq('status', 'active');

      if (error) {
        Alert.alert(
          'Error',
          error.message
        );
        return;
      }

      setPatrolling(false);
      setSessionId(null);

      Alert.alert(
        'Patrol Ended',
        'Your patrol has been completed.'
      );

      await loadAssignedRoute();
    } catch (error) {
      console.log(
        'END PATROL ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Something went wrong while ending patrol.'
      );
    } finally {
      setLoading(false);
    }
  };

  const checkIn = async () => {
    if (
      !sessionId ||
      latitude === null ||
      longitude === null
    ) {
      Alert.alert(
        'Error',
        'Start patrol first.'
      );
      return;
    }

    const { error } = await supabase
      .from('patrol_checkins')
      .insert({
        patrol_session_id: sessionId,
        latitude,
        longitude,
        notes: 'Patrol check-in',
      });

    if (error) {
      Alert.alert(
        'Error',
        error.message
      );
      return;
    }

    Alert.alert(
      'Check-in Successful',
      'Your patrol location was recorded.'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Text style={styles.back}>
            ‹ Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Patrol
        </Text>

        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadAssignedRoute}
          />
        }
      >
        <View style={styles.routeCard}>
          <Text style={styles.routeLabel}>
            🚓 Assigned Patrol Route
          </Text>

          {assignedRoute ? (
            <>
              <Text style={styles.routeName}>
                {assignedRoute.patrol_routes?.route_name ||
                  'Unknown Route'}
              </Text>

              <Text style={styles.routeDescription}>
                {assignedRoute.patrol_routes?.description ||
                  'No route description available.'}
              </Text>

              {assignedRoute.patrol_routes?.route_points &&
              assignedRoute.patrol_routes.route_points.length >
                0 ? (
                <Text style={styles.routeLocation}>
                  📍 {
                    assignedRoute.patrol_routes
                      .route_points.length
                  } route points
                </Text>
              ) : assignedRoute.patrol_routes?.latitude !==
                  null &&
                assignedRoute.patrol_routes?.longitude !==
                  null ? (
                <>
                  <Text style={styles.routeLocation}>
                    📍 Assigned Area
                  </Text>

                  <Text style={styles.coordinate}>
                    Latitude:{' '}
                    {assignedRoute.patrol_routes?.latitude?.toFixed(
                      6
                    )}
                  </Text>

                  <Text style={styles.coordinate}>
                    Longitude:{' '}
                    {assignedRoute.patrol_routes?.longitude?.toFixed(
                      6
                    )}
                  </Text>
                </>
              ) : (
                <Text style={styles.routeLocation}>
                  📍 Assigned Area: Location not set
                </Text>
              )}

              <Text style={styles.routeDate}>
                Date: {assignedRoute.assigned_date}
              </Text>

              <Text style={styles.assignedStatus}>
                ● ASSIGNED
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.noRoute}>
                No patrol route assigned for today.
              </Text>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadAssignedRoute}
              >
                <Text style={styles.buttonText}>
                  Refresh Assignment
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.label}>
            Patrol Status
          </Text>

          <Text
            style={
              patrolling
                ? styles.active
                : styles.inactive
            }
          >
            {patrolling
              ? '● PATROL ACTIVE'
              : '● NOT PATROLLING'}
          </Text>

          {patrolling && (
            <Text style={styles.sessionText}>
              Patrol session is active
            </Text>
          )}
        </View>

        <View style={styles.locationCard}>
          <Text style={styles.locationTitle}>
            📍 Current Location
          </Text>

          {latitude !== null &&
          longitude !== null ? (
            <>
              <Text style={styles.coordinate}>
                Latitude: {latitude.toFixed(6)}
              </Text>

              <Text style={styles.coordinate}>
                Longitude: {longitude.toFixed(6)}
              </Text>
            </>
          ) : (
            <Text style={styles.noLocation}>
              Location not available
            </Text>
          )}
        </View>

        {!patrolling ? (
          <TouchableOpacity
            style={[
              styles.startButton,
              !assignedRoute &&
                styles.disabledButton,
            ]}
            onPress={startPatrol}
            disabled={loading || !assignedRoute}
          >
            <Text style={styles.buttonText}>
              {loading
                ? 'Starting...'
                : 'Start Patrol'}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.checkButton}
              onPress={checkIn}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                📍 Patrol Check-in
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.endButton}
              onPress={endPatrol}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? 'Ending...'
                  : 'End Patrol'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.info}>
          GPS location is recorded while patrol
          is active.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
    padding: 20,
  },

  header: {
    marginTop: 35,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  back: {
    color: '#7777B8',
    fontSize: 17,
    fontWeight: 'bold',
    width: 50,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },

  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 22,
    marginBottom: 15,
  },

  routeLabel: {
    color: '#777',
    fontSize: 14,
    fontWeight: 'bold',
  },

  routeName: {
    color: '#30305F',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },

  routeDescription: {
    color: '#555',
    fontSize: 14,
    marginTop: 8,
  },

  routeLocation: {
    color: '#30305F',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 12,
  },

  routeDate: {
    color: '#777',
    marginTop: 12,
  },

  assignedStatus: {
    color: '#2E8B57',
    fontWeight: 'bold',
    marginTop: 10,
  },

  noRoute: {
    color: '#888',
    fontSize: 15,
    marginTop: 10,
  },

  refreshButton: {
    backgroundColor: '#7777B8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },

  statusCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 22,
    marginBottom: 15,
  },

  label: {
    color: '#777',
    fontSize: 14,
  },

  active: {
    color: '#2E8B57',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },

  inactive: {
    color: '#888',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },

  sessionText: {
    color: '#2E8B57',
    fontSize: 13,
    marginTop: 6,
  },

  locationCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 22,
    marginBottom: 25,
  },

  locationTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },

  coordinate: {
    color: '#555',
    fontSize: 15,
    marginTop: 5,
  },

  noLocation: {
    color: '#999',
  },

  startButton: {
    backgroundColor: '#7777B8',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  disabledButton: {
    opacity: 0.5,
  },

  checkButton: {
    backgroundColor: '#7777B8',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  endButton: {
    backgroundColor: '#555',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  info: {
    textAlign: 'center',
    color: '#888',
    marginTop: 25,
    marginBottom: 30,
    fontSize: 13,
  },
});