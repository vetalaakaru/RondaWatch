import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

type Resident = {
  id: string;
  full_name: string;
};

export default function TanodChat() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'resident')
      .order('full_name');

    if (!error && data) {
      setResidents(data);
    }

    setLoading(false);
  };

  const openChat = (resident: Resident) => {
    router.push({
      pathname: '/tanod-chat-room',
      params: {
        residentId: resident.id,
        residentName: resident.full_name,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Chat with Resident</Text>

        <View style={{ width: 30 }} />
      </View>

      <Text style={styles.subtitle}>Select a resident to start chatting</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#7777B8" />
      ) : residents.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No Residents Found</Text>
          <Text style={styles.emptyText}>
            Registered residents will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={residents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.residentCard}
              onPress={() => openChat(item)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.full_name?.charAt(0).toUpperCase() || 'R'}
                </Text>
              </View>

              <View style={styles.info}>
                <Text style={styles.name}>{item.full_name}</Text>
                <Text style={styles.tapText}>Tap to open chat</Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  back: {
    fontSize: 38,
    color: '#7777B8',
  },

  title: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#333',
  },

  subtitle: {
    color: '#777',
    marginBottom: 20,
  },

  residentCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7777B8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: 'white',
    fontSize: 21,
    fontWeight: 'bold',
  },

  info: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  tapText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },

  arrow: {
    fontSize: 30,
    color: '#7777B8',
  },

  empty: {
    alignItems: 'center',
    marginTop: 100,
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  emptyText: {
    color: '#777',
    marginTop: 5,
    textAlign: 'center',
  },
});
