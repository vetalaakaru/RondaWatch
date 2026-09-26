import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';

type SOS = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
};

export default function SOS() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentSOS, setCurrentSOS] = useState<SOS | null>(null);

  const loadSOS = async () => {
    setLoading(true);

    const {
      data: userData,
    } = await supabase.auth.getUser();

    if (!userData.user) {
      setLoading(false);
      router.replace('/login');
      return;
    }

    const { data, error } = await supabase
      .from('sos_alerts')
      .select(`
        id,
        latitude,
        longitude,
        status,
        created_at,
        resolved_at
      `)
      .eq('resident_id', userData.user.id)
      .order('created_at', {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      if (
        data &&
        (data.status === 'active' ||
          data.status === 'responding')
      ) {
        setCurrentSOS(data);
      } else {
        setCurrentSOS(null);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSOS();
  }, []);

  const sendSOS = async () => {
    if (currentSOS) {
      Alert.alert(
        'SOS Already Active',
        'Please wait until your current SOS is resolved.'
      );
      return;
    }

    Alert.alert(
      'Emergency SOS',
      'Are you sure you want to send an emergency SOS?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: async () => {
            setSending(true);

            try {
              const {
                data: userData,
              } = await supabase.auth.getUser();

              if (!userData.user) {
                throw new Error(
                  'You are not logged in.'
                );
              }

              const {
                status,
              } =
                await Location.requestForegroundPermissionsAsync();

              if (status !== 'granted') {
                throw new Error(
                  'Location permission is required for SOS.'
                );
              }

              const location =
                await Location.getCurrentPositionAsync({
                  accuracy:
                    Location.Accuracy.High,
                });

              const { data, error } =
                await supabase
                  .from('sos_alerts')
                  .insert({
                    resident_id:
                      userData.user.id,
                    latitude:
                      location.coords.latitude,
                    longitude:
                      location.coords.longitude,
                    status: 'active',
                  })
                  .select(`
                    id,
                    latitude,
                    longitude,
                    status,
                    created_at,
                    resolved_at
                  `)
                  .single();

              if (error) {
                throw error;
              }

              setCurrentSOS(data);

              Alert.alert(
                'SOS Sent',
                'Your emergency SOS has been sent to the Tanods.'
              );
            } catch (error: any) {
              Alert.alert(
                'SOS Failed',
                error?.message ||
                  'Something went wrong.'
              );
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  const getStatusTitle = (
    status: string
  ) => {
    switch (status) {
      case 'active':
        return 'SOS ACTIVE';

      case 'responding':
        return 'TANOD RESPONDING';

      default:
        return status.toUpperCase();
    }
  };

  const getStatusMessage = (
    status: string
  ) => {
    switch (status) {
      case 'active':
        return 'Your emergency alert has been sent. Please stay in a safe location and wait for assistance.';

      case 'responding':
        return 'A Tanod has responded to your emergency. Help is on the way.';

      default:
        return 'Emergency status updated.';
    }
  };

  const getStatusIcon = (
    status: string
  ) => {
    switch (status) {
      case 'active':
        return '🚨';

      case 'responding':
        return '🛡️';

      default:
        return '🚨';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadSOS}
          />
        }
      >
        <Text style={styles.title}>
          Emergency SOS
        </Text>

        <Text style={styles.subtitle}>
          Get immediate assistance from your Barangay Tanods.
        </Text>

        {currentSOS ? (
          <View style={styles.statusCard}>
            <Text style={styles.icon}>
              {getStatusIcon(
                currentSOS.status
              )}
            </Text>

            <Text style={styles.statusTitle}>
              {getStatusTitle(
                currentSOS.status
              )}
            </Text>

            <Text style={styles.message}>
              {getStatusMessage(
                currentSOS.status
              )}
            </Text>

            <View style={styles.statusLine}>
              <View
                style={[
                  styles.step,
                  styles.stepActive,
                ]}
              >
                <Text style={styles.stepNumber}>
                  1
                </Text>
              </View>

              <View style={styles.line} />

              <View
                style={[
                  styles.step,
                  currentSOS.status ===
                    'responding'
                    ? styles.stepActive
                    : styles.stepInactive,
                ]}
              >
                <Text style={styles.stepNumber}>
                  2
                </Text>
              </View>

              <View style={styles.line} />

              <View
                style={[
                  styles.step,
                  styles.stepInactive,
                ]}
              >
                <Text style={styles.stepNumber}>
                  3
                </Text>
              </View>
            </View>

            <View style={styles.stepLabels}>
              <Text style={styles.stepLabel}>
                SOS Sent
              </Text>

              <Text style={styles.stepLabel}>
                Responding
              </Text>

              <Text style={styles.stepLabel}>
                Resolved
              </Text>
            </View>

            <Text style={styles.timeText}>
              Sent:{' '}
              {new Date(
                currentSOS.created_at
              ).toLocaleString()}
            </Text>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadSOS}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.refreshText}>
                  Check SOS Status
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sendCard}>
            <Text style={styles.bigIcon}>
              🚨
            </Text>

            <Text style={styles.sendTitle}>
              Need Emergency Help?
            </Text>

            <Text style={styles.sendText}>
              Press the button below to send your
              current location to the Barangay Tanods.
            </Text>

            <TouchableOpacity
              style={styles.sosButton}
              onPress={sendSOS}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.sosButtonText}>
                  SEND EMERGENCY SOS
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          router.replace('/resident')
        }
      >
        <Text style={styles.backText}>
          ← Back to Dashboard
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
    marginBottom: 20,
    lineHeight: 20,
  },

  sendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    marginTop: 20,
  },

  bigIcon: {
    fontSize: 65,
    marginBottom: 10,
  },

  sendTitle: {
    color: '#30305F',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  sendText: {
    color: '#666666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },

  sosButton: {
    backgroundColor: '#C0392B',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
  },

  sosButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    marginTop: 20,
    alignItems: 'center',
  },

  icon: {
    fontSize: 55,
    marginBottom: 10,
  },

  statusTitle: {
    color: '#30305F',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  message: {
    color: '#555555',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },

  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 30,
  },

  step: {
    width: 35,
    height: 35,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepActive: {
    backgroundColor: '#5555A5',
  },

  stepInactive: {
    backgroundColor: '#CCCCCC',
  },

  stepNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  line: {
    flex: 1,
    height: 3,
    backgroundColor: '#CCCCCC',
  },

  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },

  stepLabel: {
    color: '#555555',
    fontSize: 11,
    textAlign: 'center',
    width: 70,
  },

  timeText: {
    color: '#777777',
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
  },

  refreshButton: {
    backgroundColor: '#5555A5',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },

  refreshText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
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
