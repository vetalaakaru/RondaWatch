import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

type DutyLog = {
  id: string;
  start_time: string;
  end_time: string | null;
  status: string;
};

export default function TanodDutyHistory() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<DutyLog[]>([]);

  useEffect(() => {
    loadDutyHistory();
  }, []);

  const loadDutyHistory = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace('/login');
      return;
    }

    const { data, error } = await supabase
      .from('duty_logs')
      .select('id, start_time, end_time, status')
      .eq('tanod_id', user.id)
      .order('start_time', { ascending: false });

    if (!error) {
      setLogs(data ?? []);
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    );
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(
      'en-US',
      {
        hour: 'numeric',
        minute: '2-digit',
      }
    );
  };

  const getDuration = (
    start: string,
    end: string | null
  ) => {
    if (!end) {
      return 'Currently on duty';
    }

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    const minutes = Math.floor(
      (endTime - startTime) / 60000
    );

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }

    return `${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#7777B8"
        />

        <Text style={styles.loadingText}>
          Loading duty history...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Duty History
        </Text>

        <TouchableOpacity
          onPress={loadDutyHistory}
        >
          <Text style={styles.refresh}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {logs.length}
          </Text>

          <Text style={styles.summaryLabel}>
            Duty Records
          </Text>
        </View>

        {logs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🕐
            </Text>

            <Text style={styles.emptyTitle}>
              No Duty History
            </Text>

            <Text style={styles.emptyText}>
              Your duty records will appear here
              after you start and end your duty.
            </Text>
          </View>
        ) : (
          logs.map((log) => (
            <View
              key={log.id}
              style={styles.dutyCard}
            >
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.date}>
                    {formatDate(log.start_time)}
                  </Text>

                  <Text style={styles.time}>
                    {formatTime(log.start_time)}
                    {' - '}
                    {log.end_time
                      ? formatTime(log.end_time)
                      : 'Active'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    log.end_time
                      ? styles.completed
                      : styles.active,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      log.end_time
                        ? styles.completedText
                        : styles.activeText,
                    ]}
                  >
                    {log.end_time
                      ? 'COMPLETED'
                      : 'ON DUTY'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.durationRow}>
                <Text style={styles.durationLabel}>
                  Duration
                </Text>

                <Text style={styles.duration}>
                  {getDuration(
                    log.start_time,
                    log.end_time
                  )}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7F7FB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#777',
    fontSize: 14,
  },

  header: {
    marginTop: 35,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },

  refresh: {
    fontSize: 30,
    color: '#7777B8',
    width: 40,
    textAlign: 'center',
  },

  content: {
    padding: 20,
    paddingTop: 5,
    paddingBottom: 40,
  },

  summaryCard: {
    backgroundColor: '#7777B8',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    marginBottom: 15,
  },

  summaryNumber: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },

  summaryLabel: {
    color: '#E8E8F5',
    fontSize: 14,
    marginTop: 3,
  },

  dutyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  date: {
    color: '#333',
    fontSize: 17,
    fontWeight: 'bold',
  },

  time: {
    color: '#777',
    fontSize: 14,
    marginTop: 5,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  completed: {
    backgroundColor: '#DDF5E5',
  },

  active: {
    backgroundColor: '#FFF2CC',
  },

  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  completedText: {
    color: '#217A3B',
  },

  activeText: {
    color: '#8A6500',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 15,
  },

  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  durationLabel: {
    color: '#888',
    fontSize: 13,
  },

  duration: {
    color: '#7777B8',
    fontSize: 15,
    fontWeight: 'bold',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 10,
  },

  emptyTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },

  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
});
