import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>

      <Text style={styles.logo}>🛡️</Text>

      <Text style={styles.title}>RondaWatch</Text>

      <Text style={styles.subtitle}>
        Barangay safety and patrol, together
      </Text>

      <Text style={styles.description}>
        Report hazards, track patrols, stay updated
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/register')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.loginText}>
          I already have an account
        </Text>
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
    fontSize: 65,
    marginBottom: 15,
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },

  description: {
    color: '#E8E8F5',
    fontSize: 13,
    marginBottom: 50,
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 14,
  },

  buttonText: {
    color: '#30305F',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loginButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
  },

  loginText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
