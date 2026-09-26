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
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function TanodProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [tanodId, setTanodId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [idPhotoUrl, setIdPhotoUrl] = useState('');

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      router.replace('/login');
      return;
    }

    setEmail(user.email || '');

    const { data: profile, error: profileError } =
      await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();

    if (profileError) {
      setLoading(false);
      Alert.alert('Error', profileError.message);
      return;
    }

    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');

    const { data: tanod, error: tanodError } =
      await supabase
        .from('tanod_profiles')
        .select(
          'tanod_id_number, verification_status, id_photo_url'
        )
        .eq('id', user.id)
        .single();

    if (tanodError) {
      setLoading(false);
      Alert.alert('Error', tanodError.message);
      return;
    }

    setTanodId(tanod?.tanod_id_number || '');
    setVerificationStatus(
      tanod?.verification_status || 'pending'
    );

    if (tanod?.id_photo_url) {
      const { data: signedData, error: signedError } =
        await supabase.storage
          .from('tanod-ids')
          .createSignedUrl(
            tanod.id_photo_url,
            3600
          );

      if (!signedError && signedData?.signedUrl) {
        setIdPhotoUrl(signedData.signedUrl);
      }
    }

    setLoading(false);
  }

  async function saveProfile() {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name.');
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      router.replace('/login');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      Alert.alert('Save Failed', error.message);
      return;
    }

    setEditing(false);

    Alert.alert(
      'Success',
      'Your profile has been updated.'
    );

    loadProfile();
  }

  async function logout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const { error } =
              await supabase.auth.signOut();

            if (error) {
              Alert.alert(
                'Logout Failed',
                error.message
              );
              return;
            }

            router.dismissAll();
            router.replace('/login');
          },
        },
      ]
    );
  }

  function getStatusColor() {
    if (verificationStatus === 'approved') {
      return '#2E9D50';
    }

    if (verificationStatus === 'rejected') {
      return '#C94A4A';
    }

    return '#C58A20';
  }

  function getStatusText() {
    if (verificationStatus === 'approved') {
      return 'Approved';
    }

    if (verificationStatus === 'rejected') {
      return 'Rejected';
    }

    return 'Pending Verification';
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#7777B8"
        />

        <Text style={styles.loadingText}>
          Loading Profile...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Tanod Profile
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            👮
          </Text>
        </View>

        <Text style={styles.profileName}>
          {fullName || 'Tanod'}
        </Text>

        <Text style={styles.profileRole}>
          Barangay Tanod
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        <Text style={styles.label}>
          Full Name
        </Text>

        {editing ? (
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full Name"
          />
        ) : (
          <Text style={styles.value}>
            {fullName || 'Not provided'}
          </Text>
        )}

        <Text style={styles.label}>
          Phone Number
        </Text>

        {editing ? (
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone Number"
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>
            {phone || 'Not provided'}
          </Text>
        )}

        <Text style={styles.label}>
          Email
        </Text>

        <Text style={styles.value}>
          {email || 'Not provided'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Tanod Information
        </Text>

        <Text style={styles.label}>
          Tanod ID Number
        </Text>

        <Text style={styles.value}>
          {tanodId || 'Not provided'}
        </Text>

        <Text style={styles.label}>
          Verification Status
        </Text>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                getStatusColor() + '20',
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  getStatusColor(),
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color: getStatusColor(),
              },
            ]}
          >
            {getStatusText()}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Tanod ID
        </Text>

        {idPhotoUrl ? (
          <Image
            source={{ uri: idPhotoUrl }}
            style={styles.idImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageIcon}>
              🪪
            </Text>

            <Text style={styles.noImageText}>
              Tanod ID photo not available
            </Text>
          </View>
        )}
      </View>

      {editing ? (
        <>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveProfile}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setEditing(false);
              loadProfile();
            }}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setEditing(true)}
        >
          <Text style={styles.primaryButtonText}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() =>
          router.push('/tanod-change-password')
        }
      >
        <Text style={styles.optionIcon}>
          🔐
        </Text>

        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>
            Change Password
          </Text>

          <Text style={styles.optionDescription}>
            Update your account password
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadProfile}
      >
        <Text style={styles.refreshText}>
          Refresh Profile
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
      >
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5FA',
    padding: 20,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F5FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#777',
    fontSize: 14,
  },

  header: {
    marginTop: 40,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E9E8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    color: '#55558F',
    fontSize: 32,
    marginTop: -4,
  },

  headerTitle: {
    color: '#30305F',
    fontSize: 21,
    fontWeight: 'bold',
  },

  headerSpace: {
    width: 44,
  },

  profileHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E9E8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 45,
  },

  profileName: {
    color: '#30305F',
    fontSize: 22,
    fontWeight: 'bold',
  },

  profileRole: {
    color: '#7777B8',
    fontSize: 14,
    marginTop: 4,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    elevation: 2,
  },

  sectionTitle: {
    color: '#30305F',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 18,
  },

  label: {
    color: '#888',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 5,
  },

  value: {
    color: '#30305F',
    fontSize: 15,
  },

  input: {
    backgroundColor: '#F7F7FB',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    color: '#30305F',
    fontSize: 15,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },

  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
  },

  idImage: {
    width: '100%',
    height: 210,
    borderRadius: 12,
    backgroundColor: '#EEE',
  },

  noImage: {
    height: 160,
    borderRadius: 12,
    backgroundColor: '#F3F3F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  noImageIcon: {
    fontSize: 40,
    marginBottom: 8,
  },

  noImageText: {
    color: '#888',
    fontSize: 13,
  },

  primaryButton: {
    backgroundColor: '#7777B8',
    borderRadius: 11,
    padding: 15,
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  saveButton: {
    backgroundColor: '#7777B8',
    borderRadius: 11,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  cancelButton: {
    backgroundColor: '#E9E8F8',
    borderRadius: 11,
    padding: 15,
    alignItems: 'center',
    marginBottom: 12,
  },

  cancelButtonText: {
    color: '#55558F',
    fontSize: 15,
    fontWeight: 'bold',
  },

  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  optionIcon: {
    fontSize: 28,
    marginRight: 13,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    color: '#30305F',
    fontSize: 15,
    fontWeight: 'bold',
  },

  optionDescription: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },

  arrow: {
    color: '#7777B8',
    fontSize: 28,
  },

  refreshButton: {
    backgroundColor: '#E9E8F8',
    borderRadius: 11,
    padding: 15,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },

  refreshText: {
    color: '#7777B8',
    fontSize: 15,
    fontWeight: 'bold',
  },

  logoutButton: {
    backgroundColor: '#30305F',
    borderRadius: 11,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  bottomSpace: {
    height: 40,
  },
});
