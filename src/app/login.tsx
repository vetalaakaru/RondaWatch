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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    if (!email.trim() || !password) {
      Alert.alert(
        'Missing Information',
        'Please enter your email and password.'
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        Alert.alert('Login Failed', error.message);
        return;
      }

      if (!data.user) {
        Alert.alert(
          'Login Failed',
          'User account was not found.'
        );
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

      if (profileError || !profile) {
        Alert.alert(
          'Error',
          'Could not load your account profile.'
        );
        return;
      }

      if (profile.role === 'barangay_officer') {
        router.replace('/officer');
        return;
      }

      if (profile.role === 'resident') {
        router.replace('/resident');
        return;
      }

      if (profile.role === 'tanod') {
        const { data: tanod, error: tanodError } =
          await supabase
            .from('tanod_profiles')
            .select('verification_status')
            .eq('id', data.user.id)
            .single();

        if (tanodError || !tanod) {
          Alert.alert(
            'Error',
            'Could not load Tanod verification status.'
          );
          return;
        }

        if (tanod.verification_status === 'pending') {
          router.replace('/tanod-pending');
          return;
        }

        if (tanod.verification_status === 'approved') {
          router.replace('/tanod');
          return;
        }

        if (tanod.verification_status === 'rejected') {
          Alert.alert(
            'Tanod Account Rejected',
            'Your Tanod account has not been approved.'
          );

          await supabase.auth.signOut();
          return;
        }
      }

      Alert.alert(
        'Login Failed',
        'Unknown account role.'
      );
    } catch (error) {
      console.log('LOGIN ERROR:', error);

      Alert.alert(
        'Error',
        'Something went wrong while logging in.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🛡️</Text>

      <Text style={styles.title}>Welcome Back</Text>

      <Text style={styles.subtitle}>
        Login to your RondaWatch account
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          editable={!loading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.loginButton,
          loading && styles.disabledButton,
        ]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

            <Text style={styles.buttonText}>
              Logging in...
            </Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>
            Login
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          if (!loading) {
            router.push('/register');
          }
        }}
        disabled={loading}
      >
        <Text style={styles.registerText}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5FC',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  logo: {
    fontSize: 60,
    textAlign: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#292133',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 30,
  },

  field: {
    marginBottom: 15,
  },

  label: {
    color: '#292133',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    fontSize: 15,
    color: '#292133',
    borderWidth: 1,
    borderColor: '#E6E0EF',
  },

  loginButton: {
    backgroundColor: '#6C3FC5',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },

  disabledButton: {
    opacity: 0.7,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  registerText: {
    color: '#6C3FC5',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 22,
  },
});
