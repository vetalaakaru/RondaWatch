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
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system/legacy';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import {
  createIncidentDraft,
  deleteIncidentDraft,
  getIncidentDraft,
  updateIncidentDraft,
} from '../../lib/offlineDrafts';

const incidentTypes = [
  'Crime',
  'Accident',
  'Fire',
  'Suspicious Activity',
  'Public Disturbance',
  'Medical Emergency',
  'Other',
];

export default function Report() {
  const { draftId } = useLocalSearchParams<{
    draftId?: string;
  }>();

  const isEditingDraft = !!draftId;

  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);

  useEffect(() => {
    if (!draftId) {
      return;
    }

    const loadDraft = async () => {
      setLoadingDraft(true);

      try {
        const id = Number(draftId);

        if (!Number.isInteger(id) || id <= 0) {
          Alert.alert(
            'Invalid Draft',
            'The selected draft is invalid.',
            [
              {
                text: 'OK',
                onPress: () =>
                  router.replace('/resident-drafts'),
              },
            ]
          );

          return;
        }

        const draft = await getIncidentDraft(id);

        if (!draft) {
          Alert.alert(
            'Draft Not Found',
            'This draft no longer exists.',
            [
              {
                text: 'OK',
                onPress: () =>
                  router.replace('/resident-drafts'),
              },
            ]
          );

          return;
        }

        setIncidentType(draft.incidentType);
        setDescription(draft.description);
        setImageUri(draft.photoUri);
        setLatitude(draft.latitude);
        setLongitude(draft.longitude);
      } catch (error: any) {
        console.log(
          'Load draft error:',
          error?.message || error
        );

        Alert.alert(
          'Error',
          'Unable to load this draft.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.replace('/resident-drafts'),
            },
          ]
        );
      } finally {
        setLoadingDraft(false);
      }
    };

    loadDraft();
  }, [draftId]);

  const pickImage = async () => {
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
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
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
      await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const getLocation = async () => {
    const permission =
      await Location.requestForegroundPermissionsAsync();

    if (permission.status !== 'granted') {
      return null;
    }

    try {
      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch {
      return null;
    }
  };

  const saveDraft = async () => {
    if (!incidentType) {
      Alert.alert(
        'Missing Information',
        'Please select an incident type.'
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter an incident description.'
      );
      return;
    }

    setSavingDraft(true);

    try {
      const location = await getLocation();

      const finalLatitude =
        location?.latitude ?? latitude ?? null;

      const finalLongitude =
        location?.longitude ?? longitude ?? null;

      if (isEditingDraft) {
        const id = Number(draftId);

        if (!Number.isInteger(id) || id <= 0) {
          throw new Error(
            'Invalid draft ID.'
          );
        }

        await updateIncidentDraft(id, {
          incidentType,
          description: description.trim(),
          photoUri: imageUri,
          latitude: finalLatitude,
          longitude: finalLongitude,
        });

        Alert.alert(
          'Draft Updated',
          'Your changes have been saved successfully.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.replace('/resident-drafts'),
            },
          ]
        );

        return;
      }

      await createIncidentDraft({
        incidentType,
        description: description.trim(),
        photoUri: imageUri,
        latitude: finalLatitude,
        longitude: finalLongitude,
      });

      Alert.alert(
        'Draft Saved',
        'Your incident report has been saved on this device. You can submit it when you have internet.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIncidentType('');
              setDescription('');
              setImageUri(null);
              setLatitude(null);
              setLongitude(null);
              router.replace('/resident');
            },
          },
        ]
      );
    } catch (error: any) {
      console.log(
        'Save draft error:',
        error?.message || error
      );

      Alert.alert(
        'Draft Failed',
        error?.message ||
          'Unable to save the incident draft.'
      );
    } finally {
      setSavingDraft(false);
    }
  };

  const uploadIncidentPhoto = async (
    uri: string,
    userId: string
  ) => {
    try {
      const fileInfo =
        await FileSystem.getInfoAsync(uri);

      if (!fileInfo.exists) {
        throw new Error(
          'Selected image file does not exist.'
        );
      }

      const base64 =
        await FileSystem.readAsStringAsync(uri, {
          encoding:
            FileSystem.EncodingType.Base64,
        });

      if (!base64 || base64.length === 0) {
        throw new Error(
          'Unable to read the selected image.'
        );
      }

      const binaryString = atob(base64);

      const bytes = new Uint8Array(
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
        error: uploadError,
      } = await supabase.storage
        .from('incident-photos')
        .upload(
          filePath,
          bytes,
          {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      return filePath;
    } catch (error: any) {
      console.log(
        'Photo upload error:',
        error?.message || error
      );

      throw error;
    }
  };

  const submitReport = async () => {
    if (!incidentType) {
      Alert.alert(
        'Missing Information',
        'Please select an incident type.'
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter an incident description.'
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert(
          'Login Required',
          'Please login again before submitting a report.'
        );
        return;
      }

      let currentLatitude = latitude;
      let currentLongitude = longitude;

      const location = await getLocation();

      if (location) {
        currentLatitude = location.latitude;
        currentLongitude = location.longitude;
      }

      if (
        currentLatitude === null ||
        currentLongitude === null
      ) {
        Alert.alert(
          'Location Required',
          'Please allow location access so the incident location can be recorded.'
        );
        return;
      }

      let photoPath: string | null = null;

      if (imageUri) {
        try {
          photoPath =
            await uploadIncidentPhoto(
              imageUri,
              user.id
            );
        } catch (error: any) {
          Alert.alert(
            'Photo Upload Failed',
            error?.message ||
              'Unable to upload the incident photo.'
          );
          return;
        }
      }

      const {
        data,
        error,
      } = await supabase
        .from('incidents')
        .insert({
          reporter_id: user.id,
          incident_type: incidentType,
          description: description.trim(),
          photo_url: photoPath,
          latitude: currentLatitude,
          longitude: currentLongitude,
          status: 'reported',
        })
        .select()
        .single();

      if (error) {
        if (photoPath) {
          await supabase.storage
            .from('incident-photos')
            .remove([photoPath]);
        }

        Alert.alert(
          'Report Failed',
          error.message
        );

        return;
      }

      console.log(
        'Incident created:',
        data?.id
      );

      if (isEditingDraft && draftId) {
        const id = Number(draftId);

        if (!Number.isInteger(id) || id <= 0) {
          Alert.alert(
            'Draft Error',
            'The incident was submitted, but the local draft ID is invalid.'
          );
          return;
        }

        try {
          await deleteIncidentDraft(id);
        } catch (draftError: any) {
          console.log(
            'Delete submitted draft error:',
            draftError?.message || draftError
          );

          Alert.alert(
            'Draft Cleanup Warning',
            'The incident was submitted successfully, but the local draft could not be deleted.'
          );
        }
      }

      Alert.alert(
        'Report Submitted',
        'Your incident report has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIncidentType('');
              setDescription('');
              setImageUri(null);
              setLatitude(null);
              setLongitude(null);
              router.replace('/resident');
            },
          },
        ]
      );
    } catch (error: any) {
      console.log(
        'Submit report error:',
        error?.message || error
      );

      Alert.alert(
        'Error',
        error?.message ||
          'Something went wrong while submitting the report.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingDraft) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#30305F"
        />

        <Text style={styles.loadingText}>
          Loading draft...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (isEditingDraft) {
              router.replace(
                '/resident-drafts'
              );
            } else {
              router.replace('/resident');
            }
          }}
        >
          <Text style={styles.back}>
            ‹ Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {isEditingDraft
            ? 'Edit Draft'
            : 'Report Incident'}
        </Text>

        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.card}>
          <Text style={styles.label}>
            Incident Type
          </Text>

          <View
            style={
              styles.typeContainer
            }
          >
            {incidentTypes.map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    incidentType ===
                      type &&
                      styles.typeButtonSelected,
                  ]}
                  onPress={() =>
                    setIncidentType(
                      type
                    )
                  }
                >
                  <Text
                    style={[
                      styles.typeText,
                      incidentType ===
                        type &&
                        styles.typeTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <Text style={styles.label}>
            Description
          </Text>

          <TextInput
            style={
              styles.descriptionInput
            }
            placeholder="Describe what happened..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={
              setDescription
            }
          />

          <Text style={styles.label}>
            Evidence Photo
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
                takePhoto
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
                pickImage
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

          {imageUri && (
            <View
              style={
                styles.previewContainer
              }
            >
              <Image
                source={{
                  uri: imageUri,
                }}
                style={
                  styles.preview
                }
              />

              <TouchableOpacity
                style={
                  styles.removeButton
                }
                onPress={() =>
                  setImageUri(
                    null
                  )
                }
              >
                <Text
                  style={
                    styles.removeText
                  }
                >
                  Remove Photo
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View
            style={
              styles.locationInfo
            }
          >
            <Text
              style={
                styles.locationIcon
              }
            >
              📍
            </Text>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.locationTitle
                }
              >
                Incident Location
              </Text>

              <Text
                style={
                  styles.locationText
                }
              >
                {latitude !== null &&
                longitude !== null
                  ? 'A location is saved with this draft.'
                  : 'Your GPS location will be recorded when you submit or save the draft.'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.draftButton,
              savingDraft &&
                styles.submitButtonDisabled,
            ]}
            onPress={
              saveDraft
            }
            disabled={
              savingDraft ||
              loading
            }
          >
            {savingDraft ? (
              <>
                <ActivityIndicator
                  color="#30305F"
                  size="small"
                />

                <Text
                  style={[
                    styles.draftText,
                    {
                      marginLeft: 10,
                    },
                  ]}
                >
                  {isEditingDraft
                    ? 'Updating Draft...'
                    : 'Saving Draft...'}
                </Text>
              </>
            ) : (
              <Text
                style={
                  styles.draftText
                }
              >
                {isEditingDraft
                  ? '💾 Update Draft'
                  : '💾 Save as Draft'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading &&
                styles.submitButtonDisabled,
            ]}
            onPress={
              submitReport
            }
            disabled={
              loading ||
              savingDraft
            }
          >
            {loading ? (
              <>
                <ActivityIndicator
                  color="#FFFFFF"
                  size="small"
                />

                <Text
                  style={[
                    styles.submitText,
                    {
                      marginLeft: 10,
                    },
                  ]}
                >
                  Submitting...
                </Text>
              </>
            ) : (
              <Text
                style={
                  styles.submitText
                }
              >
                {isEditingDraft
                  ? 'Submit Draft'
                  : 'Submit Incident Report'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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

  loadingScreen: {
    flex: 1,
    backgroundColor:
      '#F7F7FB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#777',
    fontSize: 14,
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

  scrollContent: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor:
      '#FFFFFF',
    borderRadius: 15,
    padding: 20,
  },

  label: {
    color: '#30305F',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 10,
  },

  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },

  typeButton: {
    borderWidth: 1,
    borderColor:
      '#D5D5E5',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor:
      '#FFFFFF',
  },

  typeButtonSelected: {
    backgroundColor:
      '#7777B8',
    borderColor:
      '#7777B8',
  },

  typeText: {
    color: '#555',
    fontSize: 13,
  },

  typeTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  descriptionInput: {
    minHeight: 130,
    borderWidth: 1,
    borderColor:
      '#D5D5E5',
    borderRadius: 10,
    padding: 14,
    color: '#333',
    fontSize: 15,
    marginBottom: 18,
  },

  photoButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
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
    marginBottom: 15,
  },

  preview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    resizeMode: 'cover',
  },

  removeButton: {
    marginTop: 8,
    backgroundColor:
      '#C0392B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  removeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  locationInfo: {
    flexDirection: 'row',
    backgroundColor:
      '#F0F0F8',
    borderRadius: 10,
    padding: 14,
    marginTop: 5,
    marginBottom: 20,
  },

  locationIcon: {
    fontSize: 25,
    marginRight: 10,
  },

  locationTitle: {
    color: '#30305F',
    fontWeight: 'bold',
    marginBottom: 4,
  },

  locationText: {
    color: '#777',
    fontSize: 13,
    lineHeight: 18,
  },

  draftButton: {
    backgroundColor:
      '#F0F0F8',
    borderWidth: 1,
    borderColor:
      '#7777B8',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },

  draftText: {
    color: '#30305F',
    fontSize: 16,
    fontWeight: 'bold',
  },

  submitButton: {
    backgroundColor:
      '#30305F',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
