import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function ResidentProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        return;
      }

      setEmail(user.email || '');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, phone, role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('PROFILE ERROR:', error);
        Alert.alert('Error', 'Could not load your profile.');
        return;
      }

      if (profile.role !== 'resident') {
        Alert.alert(
          'Access Denied',
          'This profile is for residents only.'
        );
        router.replace('/resident');
        return;
      }

      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setEditName(profile.full_name || '');
      setEditPhone(profile.phone || '');
    } catch (error) {
      console.log('LOAD PROFILE ERROR:', error);

      Alert.alert(
        'Error',
        'Something went wrong while loading your profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openEditProfile = () => {
    setEditName(fullName);
    setEditPhone(phone);
    setEditModalVisible(true);
  };

  const saveProfile = async () => {
    if (saving) return;

    if (!editName.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter your full name.'
      );
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert(
          'Session Expired',
          'Please login again.'
        );

        router.replace('/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editName.trim(),
          phone: editPhone.trim(),
        })
        .eq('id', user.id);

      if (error) {
        console.log('UPDATE PROFILE ERROR:', error);

        Alert.alert(
          'Update Failed',
          error.message
        );

        return;
      }

      setFullName(editName.trim());
      setPhone(editPhone.trim());
      setEditModalVisible(false);

      Alert.alert(
        'Profile Updated',
        'Your profile has been updated successfully.'
      );
    } catch (error) {
      console.log('SAVE PROFILE ERROR:', error);

      Alert.alert(
        'Error',
        'Something went wrong while updating your profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (changingPassword) return;

    if (!newPassword || !confirmPassword) {
      Alert.alert(
        'Missing Information',
        'Please enter and confirm your new password.'
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        'Invalid Password',
        'Password must be at least 6 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        'Password Mismatch',
        'The passwords do not match.'
      );
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        Alert.alert(
          'Password Change Failed',
          error.message
        );
        return;
      }

      setNewPassword('');
      setConfirmPassword('');
      setPasswordModalVisible(false);

      Alert.alert(
        'Password Changed',
        'Your password has been changed successfully.'
      );
    } catch (error) {
      console.log('CHANGE PASSWORD ERROR:', error);

      Alert.alert(
        'Error',
        'Something went wrong while changing your password.'
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const logout = () => {
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
            try {
              await supabase.auth.signOut();
              router.replace('/');
            } catch (error) {
              console.log('LOGOUT ERROR:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#6C3FC5"
        />

        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/resident')}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          My Profile
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>
            👤
          </Text>
        </View>

        <Text style={styles.name}>
          {fullName || 'Resident'}
        </Text>

        <Text style={styles.accountType}>
          Resident Account
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Personal Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Full Name
            </Text>

            <Text style={styles.infoValue}>
              {fullName || 'Not set'}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Phone Number
            </Text>

            <Text style={styles.infoValue}>
              {phone || 'Not set'}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Email
            </Text>

            <Text style={styles.infoValue}>
              {email || 'Not available'}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Account Type
            </Text>

            <Text style={styles.infoValue}>
              Resident
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={openEditProfile}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setPasswordModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>
            Change Password
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!saving) {
            setEditModalVisible(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Edit Profile
            </Text>

            <Text style={styles.inputLabel}>
              Full Name
            </Text>

            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              editable={!saving}
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>
              Phone Number
            </Text>

            <TextInput
              style={styles.input}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              editable={!saving}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  if (!saving) {
                    setEditModalVisible(false);
                  }
                }}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveProfile}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                    size="small"
                  />
                ) : (
                  <Text style={styles.saveText}>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!changingPassword) {
            setPasswordModalVisible(false);
          }
        }}
      >
        <KeyboardAvoidingView
          style={styles.passwordKeyboard}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                Change Password
              </Text>

              <Text style={styles.inputLabel}>
                New Password
              </Text>

              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#999"
                secureTextEntry
                editable={!changingPassword}
              />

              <Text style={styles.inputLabel}>
                Confirm Password
              </Text>

              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#999"
                secureTextEntry
                editable={!changingPassword}
              />

              <Text style={styles.passwordHint}>
                Password must be at least 6 characters.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    if (!changingPassword) {
                      setPasswordModalVisible(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }
                  }}
                  disabled={changingPassword}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelText}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={changePassword}
                  disabled={changingPassword}
                  activeOpacity={0.8}
                >
                  {changingPassword ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                      size="small"
                    />
                  ) : (
                    <Text style={styles.saveText}>
                      Change
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5FC',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7F5FC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#777',
    fontSize: 14,
  },

  header: {
    height: 95,
    backgroundColor: '#6C3FC5',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 16,
    paddingTop: 30,
  },

  backButton: {
    width: 80,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
  },

  headerSpacer: {
    width: 80,
  },

  content: {
    padding: 22,
    paddingBottom: 40,
  },

  profileIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E8DDF8',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  profileIconText: {
    fontSize: 45,
  },

  name: {
    color: '#292133',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 14,
  },

  accountType: {
    color: '#6C3FC5',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 25,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6E0EF',
    marginBottom: 18,
  },

  cardTitle: {
    color: '#292133',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 16,
  },

  infoRow: {
    paddingVertical: 9,
  },

  infoLabel: {
    color: '#777',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },

  infoValue: {
    color: '#292133',
    fontSize: 15,
    fontWeight: '700',
  },

  separator: {
    height: 1,
    backgroundColor: '#EEEAF4',
  },

  primaryButton: {
    backgroundColor: '#6C3FC5',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  secondaryButton: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6C3FC5',
    marginBottom: 12,
  },

  secondaryButtonText: {
    color: '#6C3FC5',
    fontSize: 15,
    fontWeight: '800',
  },

  logoutButton: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9534F',
    marginTop: 8,
  },

  logoutText: {
    color: '#D9534F',
    fontSize: 15,
    fontWeight: '800',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },

  passwordKeyboard: {
    flex: 1,
  },

  modalTitle: {
    color: '#292133',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 20,
  },

  inputLabel: {
    color: '#292133',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },

  input: {
    height: 52,
    backgroundColor: '#F7F5FC',
    borderWidth: 1,
    borderColor: '#E6E0EF',
    borderRadius: 12,
    paddingHorizontal: 15,
    color: '#292133',
    fontSize: 15,
    marginBottom: 15,
  },

  passwordHint: {
    color: '#777',
    fontSize: 12,
    marginTop: -5,
    marginBottom: 18,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },

  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F1EEF7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '800',
  },

  saveButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#6C3FC5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
