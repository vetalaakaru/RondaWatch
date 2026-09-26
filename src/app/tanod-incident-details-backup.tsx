import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

type Incident = {
  id: string;
  incident_type: string;
  description: string;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  created_at: string;
  reporter_id: string;
  profiles: {
    full_name: string;
    phone: string | null;
  } | null;
};

export default function TanodIncidentDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const getStoragePath = (photoUrl: string) => {
    // If photo_url is already a storage path
    if (!photoUrl.startsWith('http')) {
      return photoUrl;
    }

    // Convert a Supabase storage URL into the storage path
    const marker = '/incident-photos/';

    const index = photoUrl.indexOf(marker);

    if (index !== -1) {
      return decodeURIComponent(
        photoUrl.substring(index + marker.length)
      );
    }

    return photoUrl;
  };

  const loadIncident = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Get incident first.
    // We do not embed profiles because incidents has
    // reporter_id and assigned_tanod_id relationships.
    const { data, error } = await supabase
      .from('incidents')
      .select(`
        id,
        incident_type,
        description,
        photo_url,
        latitude,
        longitude,
        status,
        created_at,
        reporter_id
      `)
      .eq('id', id)
      .single();

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }

    // Get reporter separately
    let reporter = null;

    if (data.reporter_id) {
      const { data: profileData, error: profileError } =
        await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', data.reporter_id)
          .single();

      if (!profileError) {
        reporter = profileData;
      }
    }

let photoUrl: string | null = null;

if (data.photo_url) {
  const storagePath = getStoragePath(data.photo_url);

  const { data: publicData } = supabase.storage
    .from('incident-photos')
    .getPublicUrl(storagePath);

  photoUrl = publicData.publicUrl;

  console.log('Incident Photo URL:', photoUrl);
}


    setIncident({
      ...data,
      photo_url: photoUrl,
      profiles: reporter,
    } as Incident);

    setLoading(false);
  };

  useEffect(() => {
    loadIncident();
  }, [id]);

  const updateStatus = async (
    newStatus:
      | 'acknowledged'
      | 'in_progress'
      | 'resolved'
  ) => {
    if (!incident || updating) return;

    setUpdating(true);

    const { error } = await supabase
      .from('incidents')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', incident.id);

    if (error) {
      Alert.alert(
        'Update Failed',
        error.message
      );

      setUpdating(false);
      return;
    }

    Alert.alert(
      'Status Updated',
      `Incident is now ${newStatus
        .replace('_', ' ')
        .toUpperCase()}.`
    );

    await loadIncident();

    setUpdating(false);
  };

  const handleStatusChange = (
    newStatus:
      | 'acknowledged'
      | 'in_progress'
      | 'resolved'
  ) => {
    if (newStatus === 'resolved') {
      Alert.alert(
        'Resolve Incident',
        'Are you sure this incident has been resolved?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Resolve',
            onPress: () =>
              updateStatus('resolved'),
          },
        ]
      );

      return;
    }

    updateStatus(newStatus);
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#7777B8"
        />

        <Text style={styles.loadingText}>
          Loading incident...
        </Text>
      </View>
    );
  }

  if (!incident) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          Incident not found.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Text style={styles.back}>
            ‹ Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Incident Details
        </Text>

        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        {/* INCIDENT DETAILS */}

        <View style={styles.card}>

          <Text style={styles.incidentType}>
            🚨 {incident.incident_type}
          </Text>

          {/* STATUS */}

          <View
            style={[
              styles.statusBadge,
              incident.status === 'reported'
                ? styles.reported
                : incident.status ===
                  'acknowledged'
                ? styles.acknowledged
                : incident.status ===
                  'in_progress'
                ? styles.progress
                : styles.resolved,
            ]}
          >
            <Text style={styles.statusText}>
              {incident.status
                .replace('_', ' ')
                .toUpperCase()}
            </Text>
          </View>

          {/* DESCRIPTION */}

          <Text style={styles.sectionTitle}>
            Description
          </Text>

          <Text style={styles.description}>
            {incident.description}
          </Text>

          {/* REPORTER */}

          <Text style={styles.sectionTitle}>
            Reporter
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.info}>
              👤{' '}
              {incident.profiles?.full_name ||
                'Unknown Resident'}
            </Text>

            <Text style={styles.info}>
              📞{' '}
              {incident.profiles?.phone ||
                'No phone number'}
            </Text>
          </View>

          {/* DATE */}

          <Text style={styles.sectionTitle}>
            Reported
          </Text>

          <Text style={styles.info}>
            🕒 {formatDate(incident.created_at)}
          </Text>

          {/* LOCATION */}

          <Text style={styles.sectionTitle}>
            Incident Location
          </Text>

          {incident.latitude !== null &&
          incident.longitude !== null ? (
            <View style={styles.locationBox}>
              <Text style={styles.info}>
                📍 Latitude: {incident.latitude}
              </Text>

              <Text style={styles.info}>
                📍 Longitude: {incident.longitude}
              </Text>
            </View>
          ) : (
            <Text style={styles.noData}>
              Location not available.
            </Text>
          )}

          {/* PHOTO */}

          <Text style={styles.sectionTitle}>
            Evidence Photo
          </Text>

          {incident.photo_url ? (
            <Image
              source={{
                uri: incident.photo_url,
              }}
              style={styles.photo}
              onError={(event) => {
                console.log(
                  'Image error:',
                  event.nativeEvent.error
                );
              }}
            />
          ) : (
            <View style={styles.noPhoto}>
              <Text style={styles.noPhotoIcon}>
                📷
              </Text>

              <Text style={styles.noData}>
                No incident photo available.
              </Text>
            </View>
          )}

        </View>

        {/* INCIDENT ACTION */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Incident Action
          </Text>

          {/* REPORTED */}

          {incident.status === 'reported' && (
            <TouchableOpacity
              style={styles.ackButton}
              disabled={updating}
              onPress={() =>
                handleStatusChange(
                  'acknowledged'
                )
              }
            >
              {updating ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.buttonText}>
                  ✓ Acknowledge Incident
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* ACKNOWLEDGED */}

          {incident.status ===
            'acknowledged' && (
            <TouchableOpacity
              style={styles.progressButton}
              disabled={updating}
              onPress={() =>
                handleStatusChange(
                  'in_progress'
                )
              }
            >
              {updating ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.buttonText}>
                  ▶ Mark In Progress
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* IN PROGRESS */}

          {incident.status ===
            'in_progress' && (
            <TouchableOpacity
              style={styles.resolveButton}
              disabled={updating}
              onPress={() =>
                handleStatusChange(
                  'resolved'
                )
              }
            >
              {updating ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.buttonText}>
                  ✓ Mark Resolved
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* RESOLVED */}

          {incident.status === 'resolved' && (
            <View style={styles.resolvedBox}>
              <Text style={styles.resolvedText}>
                ✅ This incident has been
                resolved.
              </Text>
            </View>
          )}

        </View>

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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7FB',
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    color: '#777',
  },

  errorText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
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
    fontSize: 21,
    fontWeight: 'bold',
    color: '#333',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },

  incidentType: {
    color: '#30305F',
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#30305F',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
  },

  description: {
    color: '#555',
    fontSize: 15,
    lineHeight: 22,
  },

  infoBox: {
    backgroundColor: '#F7F7FB',
    borderRadius: 10,
    padding: 12,
  },

  locationBox: {
    backgroundColor: '#F7F7FB',
    borderRadius: 10,
    padding: 12,
  },

  info: {
    color: '#555',
    marginBottom: 7,
  },

  noData: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  photo: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    resizeMode: 'cover',
    marginTop: 5,
  },

  noPhoto: {
    backgroundColor: '#F7F7FB',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
  },

  noPhotoIcon: {
    fontSize: 40,
    marginBottom: 8,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  reported: {
    backgroundColor: '#FFE0E0',
  },

  acknowledged: {
    backgroundColor: '#FFF0C2',
  },

  progress: {
    backgroundColor: '#DDE7FF',
  },

  resolved: {
    backgroundColor: '#DFF3E7',
  },

  statusText: {
    fontWeight: 'bold',
    fontSize: 11,
  },

  ackButton: {
    backgroundColor: '#D88A00',
    paddingVertical: 14,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 5,
  },

  progressButton: {
    backgroundColor: '#7777B8',
    paddingVertical: 14,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 5,
  },

  resolveButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 14,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 5,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },

  resolvedBox: {
    backgroundColor: '#DFF3E7',
    borderRadius: 10,
    padding: 15,
  },

  resolvedText: {
    color: '#2E8B57',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  backButton: {
    backgroundColor: '#7777B8',
    padding: 14,
    borderRadius: 8,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
