import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
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
  resolution_notes: string | null;
  resolution_photo_url: string | null;
  profiles: {
    full_name: string;
    phone: string | null;
  } | null;
};

export default function TanodIncidentDetails() {
  const { id } =
    useLocalSearchParams<{ id: string }>();

  const [incident, setIncident] =
    useState<Incident | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [resolutionNotes, setResolutionNotes] =
    useState('');

  const [resolutionPhoto, setResolutionPhoto] =
    useState<string | null>(null);

  const getStoragePath = (
    photoUrl: string
  ) => {
    if (!photoUrl.startsWith('http')) {
      return photoUrl;
    }

    const marker =
      '/incident-photos/';

    const index =
      photoUrl.indexOf(marker);

    if (index !== -1) {
      return decodeURIComponent(
        photoUrl.substring(
          index + marker.length
        )
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

    const {
      data,
      error,
    } = await supabase
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
        reporter_id,
        resolution_notes,
        resolution_photo_url
      `)
      .eq('id', id)
      .single();

    if (error) {
      Alert.alert(
        'Error',
        error.message
      );

      setLoading(false);
      return;
    }

    let reporter = null;

    if (data.reporter_id) {
      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select(
          'full_name, phone'
        )
        .eq(
          'id',
          data.reporter_id
        )
        .single();

      if (!profileError) {
        reporter = profileData;
      }
    }

    let photoUrl:
      | string
      | null = null;

    if (data.photo_url) {
      const storagePath =
        getStoragePath(
          data.photo_url
        );

      const {
        data: publicData,
      } = supabase.storage
        .from('incident-photos')
        .getPublicUrl(
          storagePath
        );

      photoUrl =
        publicData.publicUrl;
    }

    let resolutionPhotoUrl:
      | string
      | null = null;

    if (
      data.resolution_photo_url
    ) {
      const {
        data: publicData,
      } = supabase.storage
        .from(
          'incident-resolution'
        )
        .getPublicUrl(
          data.resolution_photo_url
        );

      resolutionPhotoUrl =
        publicData.publicUrl;
    }

    setIncident({
      ...data,
      photo_url: photoUrl,
      resolution_photo_url:
        resolutionPhotoUrl,
      profiles: reporter,
    } as Incident);

    setResolutionNotes(
      data.resolution_notes || ''
    );

    setLoading(false);
  };

  useEffect(() => {
    loadIncident();
  }, [id]);

  const pickResolutionPhoto =
    async () => {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow photo library access.'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          }
        );

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        setResolutionPhoto(
          result.assets[0].uri
        );
      }
    };

  const takeResolutionPhoto =
    async () => {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow camera access.'
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync(
          {
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          }
        );

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        setResolutionPhoto(
          result.assets[0].uri
        );
      }
    };

  const uploadResolutionPhoto =
    async (
      uri: string,
      userId: string
    ) => {
      const fileInfo =
        await FileSystem.getInfoAsync(
          uri
        );

      if (!fileInfo.exists) {
        throw new Error(
          'Selected image does not exist.'
        );
      }

      const base64 =
        await FileSystem.readAsStringAsync(
          uri,
          {
            encoding:
              FileSystem.EncodingType.Base64,
          }
        );

      if (
        !base64 ||
        base64.length === 0
      ) {
        throw new Error(
          'Unable to read the image.'
        );
      }

      const binaryString =
        atob(base64);

      const bytes =
        new Uint8Array(
          binaryString.length
        );

      for (
        let i = 0;
        i < binaryString.length;
        i++
      ) {
        bytes[i] =
          binaryString.charCodeAt(i);
      }

      const filePath =
        `${userId}/${Date.now()}.jpg`;

      const {
        error,
      } = await supabase.storage
        .from(
          'incident-resolution'
        )
        .upload(
          filePath,
          bytes,
          {
            contentType:
              'image/jpeg',
            cacheControl:
              '3600',
            upsert: false,
          }
        );

      if (error) {
        throw error;
      }

      return filePath;
    };

  const createNotification =
    async (
      status: string
    ) => {
      if (!incident) {
        return;
      }

      let title =
        'Incident Update';

      let message =
        '';

      if (
        status ===
        'acknowledged'
      ) {
        title =
          'Incident Acknowledged';

        message =
          `Your ${incident.incident_type} report has been acknowledged by a Barangay Tanod.`;
      }

      if (
        status ===
        'in_progress'
      ) {
        title =
          'Incident In Progress';

        message =
          `Your ${incident.incident_type} report is now being handled by a Barangay Tanod.`;
      }

      if (
        status ===
        'resolved'
      ) {
        title =
          'Incident Resolved';

        message =
          `Your ${incident.incident_type} report has been resolved by a Barangay Tanod.`;
      }

      if (!message) {
        return;
      }

      const {
        error,
      } = await supabase
        .from('notifications')
        .insert({
          user_id:
            incident.reporter_id,
          title,
          message,
          type: 'incident',
          is_read: false,
        });

      if (error) {
        throw error;
      }
    };

  const updateStatus = async (
    newStatus:
      | 'acknowledged'
      | 'in_progress'
      | 'resolved'
  ) => {
    if (
      !incident ||
      updating
    ) {
      return;
    }

    if (
      newStatus ===
      'resolved'
    ) {
      if (
        !resolutionNotes.trim()
      ) {
        Alert.alert(
          'Resolution Notes Required',
          'Please enter notes describing how the incident was resolved.'
        );
        return;
      }

      if (!resolutionPhoto) {
        Alert.alert(
          'Resolution Photo Required',
          'Please take or upload a photo showing the resolved incident.'
        );
        return;
      }
    }

    setUpdating(true);

    try {
      let photoPath:
        | string
        | null = null;

      if (
        newStatus ===
          'resolved' &&
        resolutionPhoto
      ) {
        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (!user) {
          Alert.alert(
            'Login Required',
            'Please login again.'
          );

          setUpdating(false);
          return;
        }

        photoPath =
          await uploadResolutionPhoto(
            resolutionPhoto,
            user.id
          );
      }

      const updateData: any = {
        status: newStatus,
        updated_at:
          new Date().toISOString(),
      };

      if (
        newStatus ===
        'resolved'
      ) {
        updateData.resolution_notes =
          resolutionNotes.trim();

        updateData.resolution_photo_url =
          photoPath;
      }

      const {
        error,
      } = await supabase
        .from('incidents')
        .update(updateData)
        .eq(
          'id',
          incident.id
        );

      if (error) {
        Alert.alert(
          'Update Failed',
          error.message
        );
        return;
      }

      try {
        await createNotification(
          newStatus
        );
      } catch (notificationError: any) {
        Alert.alert(
          'Notification Error',
          notificationError?.message ||
            'Incident was updated, but the notification could not be created.'
        );
      }

      Alert.alert(
        'Status Updated',
        `Incident is now ${newStatus
          .replace('_', ' ')
          .toUpperCase()}.`
      );

      await loadIncident();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message ||
          'Something went wrong.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange =
    (
      newStatus:
        | 'acknowledged'
        | 'in_progress'
        | 'resolved'
    ) => {
      if (
        newStatus ===
        'resolved'
      ) {
        Alert.alert(
          'Resolve Incident',
          'Are you sure you want to mark this incident as resolved?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Resolve',
              onPress: () =>
                updateStatus(
                  'resolved'
                ),
            },
          ]
        );

        return;
      }

      updateStatus(
        newStatus
      );
    };

  const formatDate = (
    value: string
  ) => {
    return new Date(
      value
    ).toLocaleString();
  };

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#7777B8"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading incident...
        </Text>
      </View>
    );
  }

  if (!incident) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <Text
          style={
            styles.errorText
          }
        >
          Incident not found.
        </Text>

        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
    >
      <View
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={styles.back}
          >
            ‹ Back
          </Text>
        </TouchableOpacity>

        <Text
          style={styles.title}
        >
          Incident Details
        </Text>

        <View
          style={{ width: 50 }}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={styles.card}
        >
          <Text
            style={
              styles.incidentType
            }
          >
            🚨{' '}
            {incident.incident_type}
          </Text>

          <View
            style={[
              styles.statusBadge,
              incident.status ===
                'reported'
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
            <Text
              style={
                styles.statusText
              }
            >
              {incident.status
                .replace(
                  '_',
                  ' '
                )
                .toUpperCase()}
            </Text>
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Description
          </Text>

          <Text
            style={
              styles.description
            }
          >
            {incident.description}
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Reporter
          </Text>

          <View
            style={
              styles.infoBox
            }
          >
            <Text
              style={styles.info}
            >
              👤{' '}
              {incident.profiles
                ?.full_name ||
                'Unknown Resident'}
            </Text>

            <Text
              style={styles.info}
            >
              📞{' '}
              {incident.profiles
                ?.phone ||
                'No phone number'}
            </Text>
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Reported
          </Text>

          <Text
            style={styles.info}
          >
            🕒{' '}
            {formatDate(
              incident.created_at
            )}
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Incident Location
          </Text>

          {incident.latitude !==
            null &&
          incident.longitude !==
            null ? (
            <View
              style={
                styles.locationBox
              }
            >
              <Text
                style={styles.info}
              >
                📍 Latitude:{' '}
                {incident.latitude}
              </Text>

              <Text
                style={styles.info}
              >
                📍 Longitude:{' '}
                {incident.longitude}
              </Text>
            </View>
          ) : (
            <Text
              style={styles.noData}
            >
              Location not available.
            </Text>
          )}

          <Text
            style={
              styles.sectionTitle
            }
          >
            Evidence Photo
          </Text>

          {incident.photo_url ? (
            <Image
              source={{
                uri: incident.photo_url,
              }}
              style={styles.photo}
            />
          ) : (
            <View
              style={
                styles.noPhoto
              }
            >
              <Text
                style={
                  styles.noPhotoIcon
                }
              >
                📷
              </Text>

              <Text
                style={styles.noData}
              >
                No incident photo
                available.
              </Text>
            </View>
          )}
        </View>

        {incident.status !==
          'resolved' && (
          <View
            style={styles.card}
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Resolution Information
            </Text>

            {incident.status ===
              'in_progress' && (
              <>
                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Resolution Notes
                </Text>

                <TextInput
                  style={
                    styles.notesInput
                  }
                  placeholder="Describe what you did to resolve the incident..."
                  placeholderTextColor="#999"
                  multiline
                  textAlignVertical="top"
                  value={
                    resolutionNotes
                  }
                  onChangeText={
                    setResolutionNotes
                  }
                />

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Resolution Photo
                </Text>

                <View
                  style={
                    styles.photoButtons
                  }
                >
                  <TouchableOpacity
                    style={
                      styles.photoButton
                    }
                    onPress={
                      takeResolutionPhoto
                    }
                  >
                    <Text
                      style={
                        styles.photoButtonText
                      }
                    >
                      📷 Take Photo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={
                      styles.photoButton
                    }
                    onPress={
                      pickResolutionPhoto
                    }
                  >
                    <Text
                      style={
                        styles.photoButtonText
                      }
                    >
                      🖼️ Gallery
                    </Text>
                  </TouchableOpacity>
                </View>

                {resolutionPhoto && (
                  <View
                    style={
                      styles.previewContainer
                    }
                  >
                    <Image
                      source={{
                        uri: resolutionPhoto,
                      }}
                      style={
                        styles.photo
                      }
                    />

                    <TouchableOpacity
                      style={
                        styles.removeButton
                      }
                      onPress={() =>
                        setResolutionPhoto(
                          null
                        )
                      }
                    >
                      <Text
                        style={
                          styles.buttonText
                        }
                      >
                        Remove Photo
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Incident Action
            </Text>

            {incident.status ===
              'reported' && (
              <TouchableOpacity
                style={
                  styles.ackButton
                }
                disabled={
                  updating
                }
                onPress={() =>
                  handleStatusChange(
                    'acknowledged'
                  )
                }
              >
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  ✓ Acknowledge Incident
                </Text>
              </TouchableOpacity>
            )}

            {incident.status ===
              'acknowledged' && (
              <TouchableOpacity
                style={
                  styles.progressButton
                }
                disabled={
                  updating
                }
                onPress={() =>
                  handleStatusChange(
                    'in_progress'
                  )
                }
              >
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  ▶ Mark In Progress
                </Text>
              </TouchableOpacity>
            )}

            {incident.status ===
              'in_progress' && (
              <TouchableOpacity
                style={
                  styles.resolveButton
                }
                disabled={
                  updating
                }
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
                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    ✓ Mark Resolved
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {incident.status ===
          'resolved' && (
          <View
            style={styles.card}
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Resolution Details
            </Text>

            <Text
              style={styles.info}
            >
              📝{' '}
              {incident.resolution_notes ||
                'No resolution notes.'}
            </Text>

            {incident.resolution_photo_url && (
              <>
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Resolution Photo
                </Text>

                <Image
                  source={{
                    uri: incident.resolution_photo_url,
                  }}
                  style={
                    styles.photo
                  }
                />
              </>
            )}

            <View
              style={
                styles.resolvedBox
              }
            >
              <Text
                style={
                  styles.resolvedText
                }
              >
                ✅ This incident has
                been resolved.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      '#F7F7FB',
    padding: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent:
      'center',
    alignItems: 'center',
    backgroundColor:
      '#F7F7FB',
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
    justifyContent:
      'space-between',
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
    backgroundColor:
      '#FFFFFF',
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

  inputLabel: {
    color: '#555',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },

  description: {
    color: '#555',
    fontSize: 15,
    lineHeight: 22,
  },

  notesInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor:
      '#D5D5E5',
    borderRadius: 10,
    padding: 14,
    color: '#333',
    fontSize: 15,
  },

  infoBox: {
    backgroundColor:
      '#F7F7FB',
    borderRadius: 10,
    padding: 12,
  },

  locationBox: {
    backgroundColor:
      '#F7F7FB',
    borderRadius: 10,
    padding: 12,
  },

  info: {
    color: '#555',
    marginBottom: 7,
    lineHeight: 20,
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

  photoButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },

  photoButton: {
    flex: 1,
    backgroundColor:
      '#7777B8',
    paddingVertical: 13,
    borderRadius: 9,
    alignItems: 'center',
  },

  photoButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  previewContainer: {
    marginTop: 15,
  },

  removeButton: {
    marginTop: 8,
    backgroundColor:
      '#C0392B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  noPhoto: {
    backgroundColor:
      '#F7F7FB',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
  },

  noPhotoIcon: {
    fontSize: 40,
    marginBottom: 8,
  },

  statusBadge: {
    alignSelf:
      'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  reported: {
    backgroundColor:
      '#FFE0E0',
  },

  acknowledged: {
    backgroundColor:
      '#FFF0C2',
  },

  progress: {
    backgroundColor:
      '#DDE7FF',
  },

  resolved: {
    backgroundColor:
      '#DFF3E7',
  },

  statusText: {
    fontWeight: 'bold',
    fontSize: 11,
  },

  ackButton: {
    backgroundColor:
      '#D88A00',
    paddingVertical: 14,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 5,
  },

  progressButton: {
    backgroundColor:
      '#7777B8',
    paddingVertical: 14,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 5,
  },

  resolveButton: {
    backgroundColor:
      '#2E8B57',
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
    backgroundColor:
      '#DFF3E7',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
  },

  resolvedText: {
    color: '#2E8B57',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  backButton: {
    backgroundColor:
      '#7777B8',
    padding: 14,
    borderRadius: 8,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
