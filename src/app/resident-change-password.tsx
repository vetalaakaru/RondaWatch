import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function ResidentChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Optional: Verify current password first by signing in
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user || !user.email) {
        throw new Error('User session not found. Please log in again.');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setLoading(false);
        Alert.alert('Error', 'Current password is incorrect.');
        return;
      }

      // Update to the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      setLoading(false);

      if (updateError) {
        Alert.alert('Update Failed', updateError.message);
        return;
      }

      Alert.alert('Success', 'Your password has been successfully updated.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
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

        <Text style={styles.headerTitle}>Change Password</Text>

        <View style={styles.headerSpace} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Security Settings</Text>

        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          placeholderTextColor="#A0A0C0"
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password (min. 6 chars)"
          placeholderTextColor="#A0A0C0"
        />

        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          placeholderTextColor="#A0A0C0"
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Update Password</Text>
        )}
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 18,
    marginBottom: 20,
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
  input: {
    backgroundColor: '#F7F7FB',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    color: '#30305F',
    fontSize: 15,
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
  bottomSpace: {
    height: 40,
  },
});