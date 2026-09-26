import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function TanodPending() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🛡️</Text>

      <Text style={styles.title}>Tanod Account Pending</Text>

      <Text style={styles.message}>
        Your Tanod registration has been submitted successfully.
      </Text>

      <Text style={styles.status}>
        Verification Status: PENDING
      </Text>

      <Text style={styles.info}>
        Please wait for the Barangay Officer to verify your Tanod ID.
        You will be able to access the Tanod dashboard after approval.
      </Text>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },

  icon: {
    fontSize: 65,
    marginBottom: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#55558F',
    textAlign: 'center',
    marginBottom: 15,
  },

  message: {
    fontSize: 17,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },

  status: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
    padding: 12,
    borderRadius: 10,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  info: {
    fontSize: 15,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
    marginBottom: 30,
  },

  logoutButton: {
    backgroundColor: '#7777B8',
    paddingVertical: 14,
    paddingHorizontal: 45,
    borderRadius: 10,
  },

  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
