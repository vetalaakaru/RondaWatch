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

export default function OfficerAnnouncement() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function createAnnouncement() {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter an announcement title.');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Required', 'Please enter the announcement message.');
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
      .from('announcements')
      .insert({
        title: title.trim(),
        message: message.trim(),
      });

    setSaving(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert(
      'Success',
      'Safety announcement has been posted.',
      [
        {
          text: 'OK',
          onPress: () => {
            setTitle('');
            setMessage('');
            router.back();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Create Announcement
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Safety Announcement
        </Text>

        <Text style={styles.label}>
          Title
        </Text>

        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter announcement title"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>
          Message
        </Text>

        <TextInput
          style={styles.messageInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Enter announcement message"
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.postButton}
          onPress={createAnnouncement}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.postText}>
              📢 Post Announcement
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
    backgroundColor: '#F5F5FA',
    padding: 20,
  },

  header: {
    marginTop: 45,
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

  headerTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#30305F',
  },

  headerSpace: {
    width: 40,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#30305F',
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#F7F7FB',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 18,
  },

  messageInput: {
    backgroundColor: '#F7F7FB',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#333',
    height: 150,
    marginBottom: 20,
  },

  postButton: {
    backgroundColor: '#7777B8',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },

  postText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
