import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

type PatrolHistory = {
  id: string;
  start_time: string;
  end_time: string | null;
  status: string;
  patrol_routes: {
    route_name: string;
  } | null;
};

export default function TanodPatrolHistory() {
  const [history, setHistory] = useState<PatrolHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('patrol_sessions')
      .select(`
        id,
        start_time,
        end_time,
        status,
        patrol_routes (
          route_name
        )
      `)
      .eq('tanod_id', user.id)
      .order('start_time', { ascending: false });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setHistory((data as PatrolHistory[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString();
  };

  const formatTime = (value: string | null) => {
    if (!value) return 'Still active';

    return new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Patrol History</Text>

        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7777B8" />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadHistory}
            />
          }
        >
          {history.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                No Patrol History
              </Text>

              <Text style={styles.emptyText}>
                Completed patrols will appear here.
              </Text>
            </View>
          ) : (
            history.map((patrol) => (
              <View key={patrol.id} style={styles.card}>
                <Text style={styles.routeName}>
                  🚓{' '}
                  {patrol.patrol_routes?.route_name ||
                    'Patrol Route'}
                </Text>

                <Text style={styles.date}>
                  Date: {formatDate(patrol.start_time)}
                </Text>

                <View style={styles.row}>
                  <Text style={styles.label}>
                    Started:
                  </Text>

                  <Text style={styles.value}>
                    {formatTime(patrol.start_time)}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>
                    Ended:
                  </Text>

                  <Text style={styles.value}>
                    {formatTime(patrol.end_time)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    patrol.status === 'completed'
                      ? styles.completed
                      : styles.active,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {patrol.status === 'completed'
                      ? 'COMPLETED'
                      : 'ACTIVE'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
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
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  back: {
    color: '#7777B8',
    fontSize: 17,
    fontWeight: 'bold',
    width: 50,
  },

  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#333',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },

  routeName: {
    color: '#30305F',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  date: {
    color: '#777',
    marginBottom: 15,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  label: {
    color: '#777',
  },

  value: {
    color: '#333',
    fontWeight: '600',
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 8,
  },

  completed: {
    backgroundColor: '#DFF3E7',
  },

  active: {
    backgroundColor: '#FFF0C2',
  },

  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
  },

  emptyTitle: {
    color: '#30305F',
    fontSize: 19,
    fontWeight: 'bold',
  },

  emptyText: {
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
});
