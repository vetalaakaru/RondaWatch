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
      setHistory(
        (data || []).map((item: any) => ({
          id: item.id,
          start_time: item.start_time,
          end_time: item.end_time,
          status: item.status,
          patrol_routes: Array.isArray(item.patrol_routes)
            ? item.patrol_routes[0] || null
            : item.patrol_routes || null,
        }))
      );
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
          contentContainerStyle={styles.content}
        >
          {history.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🚓</Text>
              <Text style={styles.emptyTitle}>
                No Patrol History
              </Text>
              <Text style={styles.emptyText}>
                Your completed and active patrol sessions will appear here.
              </Text>
            </View>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.routeName}>
                    {item.patrol_routes?.route_name || 'Unknown Route'}
                  </Text>

                  <Text
                    style={[
                      styles.status,
                      item.status === 'completed'
                        ? styles.completed
                        : styles.active,
                    ]}
                  >
                    {item.status?.toUpperCase() || 'UNKNOWN'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Date</Text>
                  <Text style={styles.value}>
                    {formatDate(item.start_time)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Started</Text>
                  <Text style={styles.value}>
                    {formatTime(item.start_time)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Ended</Text>
                  <Text style={styles.value}>
                    {formatTime(item.end_time)}
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
  },
  header: {
    height: 60,
    backgroundColor: '#7777B8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  back: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E4E4EE',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 10,
  },
  routeName: {
    flex: 1,
    color: '#33334F',
    fontSize: 18,
    fontWeight: '700',
  },
  status: {
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  completed: {
    color: '#26734D',
    backgroundColor: '#DDF5E8',
  },
  active: {
    color: '#8A6500',
    backgroundColor: '#FFF1BF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  label: {
    color: '#777777',
    fontSize: 14,
  },
  value: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#33334F',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777777',
    fontSize: 14,
    lineHeight: 21,
  },
});
