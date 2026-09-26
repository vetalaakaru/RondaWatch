import { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'resident' | 'tanod'>('resident');
  const [tanodIdNumber, setTanodIdNumber] = useState('');
  const [tanodIdImage, setTanodIdImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickTanodId = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow photo library access to upload your Tanod ID.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setTanodIdImage(result.assets[0].uri);
    }
  };

  async function handleRegister() {
    if (!name || !phone || !email || !password) {
      Alert.alert(
        'Missing Information',
        'Please complete all fields.'
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

    if (role === 'tanod') {
      if (!tanodIdNumber.trim()) {
        Alert.alert(
          'Missing Tanod ID',
          'Please enter your Tanod ID number.'
        );
        return;
      }

      if (!tanodIdImage) {
        Alert.alert(
          'Missing Tanod ID Photo',
          'Please upload a photo of your Tanod ID.'
        );
        return;
      }
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
          phone: phone.trim(),
          role,
          tanod_id_number:
            role === 'tanod' ? tanodIdNumber.trim() : null,
        },
      },
    });

    if (error) {
      setLoading(false);
      Alert.alert('Registration Failed', error.message);
      return;
    }

    const user = data.user;

    if (!user) {
      setLoading(false);
      Alert.alert(
        'Error',
        'Account was created but user was not found.'
      );
      return;
    }

    if (role === 'tanod' && tanodIdImage) {
      try {
        const file = new File(tanodIdImage);

        if (!file.exists) {
          setLoading(false);
          Alert.alert(
            'ID Upload Failed',
            'The selected image could not be accessed.'
          );
          return;
        }

        const fileBytes = await file.bytes();

        if (fileBytes.length < 1000) {
          setLoading(false);
          Alert.alert(
            'ID Upload Failed',
            'The selected image file appears to be empty or invalid.'
          );
          return;
        }

        const fileExtension =
          file.extension?.replace('.', '').toLowerCase() || 'jpg';

        const contentType = file.type || 'image/jpeg';

        const filePath =
          `${user.id}/${Date.now()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from('tanod-ids')
          .upload(filePath, fileBytes, {
            contentType,
            upsert: false,
          });

        if (uploadError) {
          setLoading(false);
          Alert.alert(
            'ID Upload Failed',
            uploadError.message
          );
          return;
        }

        const { error: updateError } = await supabase
          .from('tanod_profiles')
          .update({
            tanod_id_number: tanodIdNumber.trim(),
            id_photo_url: filePath,
            verification_status: 'pending',
          })
          .eq('id', user.id);

        if (updateError) {
          setLoading(false);
          Alert.alert(
            'Profile Update Failed',
            updateError.message
          );
          return;
        }
      } catch (uploadError) {
        setLoading(false);
        Alert.alert(
          'Upload Error',
          'Could not upload the Tanod ID photo.'
        );
        return;
      }
    }

    setLoading(false);

    Alert.alert(
      'Registration Successful',
      role === 'tanod'
        ? 'Your Tanod account has been created and submitted for verification.'
        : 'Your account has been created. You can now login.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/login'),
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🛡️</Text>

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join RondaWatch</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#888"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.roleTitle}>Account Type</Text>

      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'resident' && styles.selectedRole,
          ]}
          onPress={() => setRole('resident')}
        >
          <Text
            style={[
              styles.roleText,
              role === 'resident' && styles.selectedRoleText,
            ]}
          >
            Resident
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'tanod' && styles.selectedRole,
          ]}
          onPress={() => setRole('tanod')}
        >
          <Text
            style={[
              styles.roleText,
              role === 'tanod' && styles.selectedRoleText,
            ]}
          >
            Tanod
          </Text>
        </TouchableOpacity>
      </View>

      {role === 'tanod' && (
        <View style={styles.tanodSection}>
          <TextInput
            style={styles.input}
            placeholder="Tanod ID Number"
            placeholderTextColor="#888"
            value={tanodIdNumber}
            onChangeText={setTanodIdNumber}
          />

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickTanodId}
          >
            <Text style={styles.uploadText}>
              📷 {tanodIdImage ? 'Change Tanod ID' : 'Upload Tanod ID'}
            </Text>
          </TouchableOpacity>

          {tanodIdImage && (
            <Image
              source={{ uri: tanodIdImage }}
              style={styles.idPreview}
            />
          )}

          <Text style={styles.pendingText}>
            Your Tanod account will be pending verification after
            registration.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating Account...' : 'Register'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.loginText}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7777B8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  logo: {
    fontSize: 45,
    marginBottom: 10,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#E8E8F5',
    marginTop: 5,
    marginBottom: 25,
  },

  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 10,
  },

  roleTitle: {
    width: '100%',
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 8,
  },

  roleRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginBottom: 15,
  },

  roleButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  selectedRole: {
    backgroundColor: '#30305F',
  },

  roleText: {
    color: '#30305F',
    fontWeight: '600',
  },

  selectedRoleText: {
    color: '#FFFFFF',
  },

  tanodSection: {
    width: '100%',
  },

  uploadButton: {
    backgroundColor: '#30305F',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },

  uploadText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  idPreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },

  pendingText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 10,
  },

  button: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 18,
  },

  buttonText: {
    color: '#30305F',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loginText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  backText: {
    color: '#E8E8F5',
    marginTop: 20,
  },
});
