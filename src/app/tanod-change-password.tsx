import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function TanodChangePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const changePassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert(
        'Required',
        'Please enter your new password and confirm it.'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must contain at least 6 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password Mismatch',
        'The passwords do not match.'
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setPassword('');
    setConfirmPassword('');

    Alert.alert(
      'Success',
      'Your password has been changed successfully.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Change Password</Text>

        <View style={styles.space} />
      </View>

      <View style={styles.card}>
        <Text style={styles.icon}>🔐</Text>

        <Text style={styles.heading}>Create New Password</Text>

        <Text style={styles.subtitle}>
          Enter a new password for your Tanod account.
        </Text>

        <Text style={styles.label}>New Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Confirm New Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          placeholderTextColor="#999"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={styles.button}
          disabled={loading}
          onPress={changePassword}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              Change Password
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  back: {
    fontSize: 40,
    color: '#7777B8',
    width: 40,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },

  space: {
    width: 40,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
  },

  icon: {
    fontSize: 45,
    textAlign: 'center',
    marginBottom: 10,
  },

  heading: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },

  subtitle: {
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 25,
  },

  label: {
    fontSize: 13,
    color: '#777',
    fontWeight: '600',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#F7F7FB',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 18,
    color: '#333',
  },

  button: {
    backgroundColor: '#7777B8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
