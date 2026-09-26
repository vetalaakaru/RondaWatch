import { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

type SOS = {
  id: string;
  resident_id: string;
  responding_tanod_id: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
};

type Profile = {
  full_name: string;
  phone: string | null;
};

export default function TanodSOS() {
  const [alerts, setAlerts] = useState<SOS[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(false);

  const loadSOS = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('sos_alerts')
      .select(`
        id,
        resident_id,
        responding_tanod_id,
        latitude,
        longitude,
        status,
        created_at,
        resolved_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }

    const sosData = (data as SOS[]) || [];
    setAlerts(sosData);

    const residentIds = [
      ...new Set(
        sosData
          .map((item) => item.resident_id)
          .filter(Boolean)
      ),
    ];

    if (residentIds.length > 0) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .in('id', residentIds);

      if (profileData) {
        const profileMap: Record<string, Profile> = {};

        profileData.forEach((profile: any) => {
          profileMap[profile.id] = {
            full_name: profile.full_name,
            phone: profile.phone,
          };
        });

        setProfiles(profileMap);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSOS();
  }, []);

  const respondToSOS = async (sosId: string) => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      Alert.alert('Error', 'You are not logged in.');
      return;
    }

    const { error } = await supabase
      .from('sos_alerts')
      .update({
        responding_tanod_id: userData.user.id,
        status: 'responding',
      })
      .eq('id', sosId)
      .eq('status', 'active');

    if (error) {
      Alert.alert('Response Failed', error.message);
      return;
    }

    Alert.alert(
      'SOS Response',
      'You are now responding to this emergency.'
    );

    loadSOS();
  };

  const resolveSOS = async (sosId: string) => {
    Alert.alert(
      'Resolve SOS',
      'Are you sure the emergency has been handled?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Resolve',
          onPress: async () => {
            const { error } = await supabase
              .from('sos_alerts')
              .update({
                status: 'resolved',
                resolved_at: new Date().toISOString(),
              })
              .eq('id', sosId)
              .eq('status', 'responding');

            if (error) {
              Alert.alert('Error', error.message);
              return;
            }

            Alert.alert(
              'SOS Resolved',
              'The emergency has been marked as resolved.'
            );

            loadSOS();
          },
        },
      ]
    );
  };

  const openLocation = (
    latitude: number | null,
    longitude: number | null
  ) => {
    if (latitude === null || longitude === null) {
      Alert.alert(
        'Location Unavailable',
        'This SOS does not have a GPS location.'
      );
      return;
    }

    const url =
      `https://www.google.com/maps/search/?api=1` +
      `&query=${latitude},${longitude}`;

    Linking.openURL(url);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'ACTIVE';
      case 'responding':
        return 'RESPONDING';
      case 'resolved':
        return 'RESOLVED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency SOS</Text>

      <Text style={styles.subtitle}>
        Resident emergency alerts
      </Text>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadSOS}
          />
        }
      >
        {alerts.length === 0 ? (
          <Text style={styles.empty}>
            No SOS alerts found.
          </Text>
        ) : (
          alerts.map((sos) => {
            const resident = profiles[sos.resident_id];

            return (
              <View key={sos.id} style={styles.card}>
                <Text style={styles.emergencyTitle}>
                  🚨 Emergency SOS
                </Text>

                <View style={styles.statusBox}>
                  <Text style={styles.statusText}>
                    {getStatusLabel(sos.status)}
                  </Text>
                </View>

                <Text style={styles.label}>
                  Resident
                </Text>

                <Text style={styles.value}>
                  {resident?.full_name || 'Unknown Resident'}
                </Text>

                {resident?.phone && (
                  <>
                    <Text style={styles.label}>
                      Phone
                    </Text>

                    <Text style={styles.value}>
                      {resident.phone}
                    </Text>
                  </>
                )}

                <Text style={styles.label}>
                  Date & Time
                </Text>

                <Text style={styles.value}>
                  {new Date(sos.created_at).toLocaleString()}
                </Text>

                <Text style={styles.label}>
                  Location
                </Text>

                {sos.latitude !== null &&
                sos.longitude !== null ? (
                  <>
                    <Text style={styles.coordinates}>
                      {sos.latitude}, {sos.longitude}
                    </Text>

                    <TouchableOpacity
                      style={styles.locationButton}
                      onPress={() =>
                        openLocation(
                          sos.latitude,
                          sos.longitude
                        )
                      }
                    >
                      <Text style={styles.buttonText}>
                        📍 View Location
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.value}>
                    Location unavailable
                  </Text>
                )}

                {sos.status === 'active' && (
                  <TouchableOpacity
                    style={styles.respondButton}
                    onPress={() =>
                      Alert.alert(
                        'Respond to SOS',
                        'Do you want to respond to this emergency?',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'Respond',
                            onPress: () =>
                              respondToSOS(sos.id),
                          },
                        ]
                      )
                    }
                  >
                    <Text style={styles.buttonText}>
                      🚨 Respond to SOS
                    </Text>
                  </TouchableOpacity>
                )}

                {sos.status === 'responding' && (
                  <TouchableOpacity
                    style={styles.resolveButton}
                    onPress={() =>
                      resolveSOS(sos.id)
                    }
                  >
                    <Text style={styles.buttonText}>
                      ✓ Mark as Resolved
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>
          ← Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7777B8',
    padding: 20,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
  },

  subtitle: {
    color: '#E8E8F5',
    marginBottom: 15,
  },

  empty: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 40,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
  },

  emergencyTitle: {
    color: '#30305F',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  statusBox: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2C94C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 15,
  },

  statusText: {
    color: '#30305F',
    fontWeight: 'bold',
  },

  label: {
    color: '#777777',
    fontSize: 13,
    marginTop: 8,
  },

  value: {
    color: '#30305F',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },

  coordinates: {
    color: '#555555',
    marginTop: 3,
    marginBottom: 8,
  },

  locationButton: {
    backgroundColor: '#5555A5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },

  respondButton: {
    backgroundColor: '#C0392B',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },

  resolveButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },

  backButton: {
    backgroundColor: '#30305F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  backText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
