import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SOS() {
  const [loading, setLoading] = useState(false);

  async function sendSOS() {
    Alert.alert(
      'Emergency SOS',
      'Are you sure you want to send an emergency SOS to the barangay responders?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'SEND SOS',
          style: 'destructive',
          onPress: createSOS,
        },
      ]
    );
  }

  async function createSOS() {
    setLoading(true);

    try {
      // Get logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Session Expired', 'Please login again.');
        router.replace('/login');
        return;
      }

      // Request location permission
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Required',
          'Please allow location access so responders can find you.'
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      // Save SOS to Supabase
      const { error } = await supabase
        .from('sos_alerts')
        .insert({
          resident_id: user.id,
          latitude,
          longitude,
          status: 'active',
        });

      if (error) {
        throw error;
      }

      Alert.alert(
        'SOS Sent',
        'Your emergency alert has been sent. Barangay responders can now see your location.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/resident'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'SOS Failed',
        error?.message || 'Unable to send emergency alert.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.icon}>🆘</Text>

        <Text style={styles.title}>Emergency SOS</Text>

        <Text style={styles.description}>
          Use this button only when you need immediate assistance from
          barangay responders.
        </Text>

        <TouchableOpacity
          style={styles.sosButton}
          onPress={sendSOS}
          disabled={loading}
        >
          <Text style={styles.sosIcon}>SOS</Text>
          <Text style={styles.sosText}>
            {loading ? 'SENDING...' : 'SEND SOS'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.info}>
          Your current location will be sent with the emergency alert.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5FA',
    padding: 20,
  },

  backButton: {
    marginTop: 40,
  },

  backText: {
    color: '#30305F',
    fontSize: 16,
    fontWeight: '600',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },

  icon: {
    fontSize: 60,
    marginBottom: 15,
  },

  title: {
    color: '#30305F',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  description: {
    color: '#777',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 40,
  },

  sosButton: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#D92D20',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },

  sosIcon: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  sosText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  info: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 30,
    maxWidth: 280,
  },
});
