import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

type Summary = {
  incidents: number;
  sos: number;
  patrols: number;
};

export default function TanodDashboard() {
  const [name, setName] = useState('Tanod');
  const [summary, setSummary] = useState<Summary>({
    incidents: 0,
    sos: 0,
    patrols: 0,
  });
  const [dutyId, setDutyId] = useState<string | null>(null);
  const [onDuty, setOnDuty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dutyLoading, setDutyLoading] = useState(false);

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 5000);

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        return true;
      }
    );

    return () => {
      clearInterval(interval);
      backHandler.remove();
    };
  }, []);

  async function loadDashboard() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace('/login');
      return;
    }

    await Promise.all([
      loadProfile(user.id),
      loadSummary(user.id),
      loadDutyStatus(user.id),
    ]);

    setLoading(false);
  }

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (data?.full_name) {
      setName(data.full_name);
    }
  }

  async function loadSummary(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const startOfDayISO =
      startOfDay.toISOString();

    const [
      incidentsResult,
      sosResult,
      patrolResult,
    ] = await Promise.all([
      supabase
        .from('incidents')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .gte('created_at', startOfDayISO),

      supabase
        .from('sos_alerts')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .gte('created_at', startOfDayISO),

      supabase
        .from('patrol_sessions')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('tanod_id', userId)
        .gte('start_time', startOfDayISO),
    ]);

    setSummary({
      incidents:
        incidentsResult.count ?? 0,
      sos:
        sosResult.count ?? 0,
      patrols:
        patrolResult.count ?? 0,
    });
  }

  async function loadDutyStatus(userId: string) {
    const { data, error } = await supabase
      .from('duty_logs')
      .select(
        'id, status, start_time, end_time'
      )
      .eq('tanod_id', userId)
      .order('start_time', {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      return;
    }

    if (
      data &&
      data.status === 'on_duty' &&
      !data.end_time
    ) {
      setDutyId(data.id);
      setOnDuty(true);
    } else {
      setDutyId(null);
      setOnDuty(false);
    }
  }

  async function startDuty() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace('/login');
      return;
    }

    setDutyLoading(true);

    const { data, error } = await supabase
      .from('duty_logs')
      .insert({
        tanod_id: user.id,
        status: 'on_duty',
      })
      .select('id')
      .single();

    if (error) {
      Alert.alert(
        'Start Duty Failed',
        error.message
      );
      setDutyLoading(false);
      return;
    }

    setDutyId(data.id);
    setOnDuty(true);
    setDutyLoading(false);

    await loadSummary(user.id);
  }

  async function endDuty() {
    if (!dutyId) {
      return;
    }

    setDutyLoading(true);

    const { error } = await supabase
      .from('duty_logs')
      .update({
        end_time: new Date().toISOString(),
        status: 'off_duty',
      })
      .eq('id', dutyId);

    if (error) {
      Alert.alert(
        'End Duty Failed',
        error.message
      );
      setDutyLoading(false);
      return;
    }

    setDutyId(null);
    setOnDuty(false);
    setDutyLoading(false);
  }

  async function logout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      Alert.alert(
        'Logout Failed',
        error.message
      );
      return;
    }

    router.replace('/login');
  }

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#7777B8"
        />

        <Text style={styles.loadingText}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.smallText}>
            Welcome back,
          </Text>

          <Text style={styles.name}>
            {name}
          </Text>

          <Text style={styles.role}>
            Barangay Tanod
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.push('/tanod-profile')
          }
        >
          <Text style={styles.shield}>
            🛡️
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dutyCard}>
        <View style={styles.dutyTop}>
          <View>
            <Text style={styles.dutyTitle}>
              Duty Status
            </Text>

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: onDuty
                      ? '#5BE37D'
                      : '#999999',
                  },
                ]}
              />

              <Text style={styles.statusText}>
                {onDuty
                  ? 'ON DUTY'
                  : 'OFF DUTY'}
              </Text>
            </View>
          </View>

          <Text style={styles.dutyIcon}>
            👮
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.dutyButton,
            onDuty &&
              styles.endDutyButton,
          ]}
          onPress={
            onDuty
              ? endDuty
              : startDuty
          }
          disabled={dutyLoading}
        >
          {dutyLoading ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.dutyButtonText}>
              {onDuty
                ? 'End Duty'
                : 'Start Duty'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>
        Today's Summary
      </Text>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>
            🚨
          </Text>

          <Text style={styles.summaryNumber}>
            {summary.incidents}
          </Text>

          <Text style={styles.summaryLabel}>
            Incidents
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>
            🆘
          </Text>

          <Text style={styles.summaryNumber}>
            {summary.sos}
          </Text>

          <Text style={styles.summaryLabel}>
            SOS Alerts
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>
            🚶
          </Text>

          <Text style={styles.summaryNumber}>
            {summary.patrols}
          </Text>

          <Text style={styles.summaryLabel}>
            Patrols
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() =>
            router.push('/tanod-incidents')
          }
        >
          <Text style={styles.actionIcon}>
            🚨
          </Text>

          <Text style={styles.actionText}>
            Incident Reports
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() =>
            router.push('/tanod-sos')
          }
        >
          <Text style={styles.actionIcon}>
            🆘
          </Text>

          <Text style={styles.actionText}>
            Emergency SOS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() =>
            router.push('/tanod-patrol')
          }
        >
          <Text style={styles.actionIcon}>
            🗺️
          </Text>

          <Text style={styles.actionText}>
            Patrol
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() =>
            router.push('/tanod-chat')
          }
        >
          <Text style={styles.actionIcon}>
            💬
          </Text>

          <Text style={styles.actionText}>
            Messages
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() =>
          router.push('/tanod-patrol-history')
        }
      >
        <Text style={styles.historyIcon}>
          📋
        </Text>

        <View style={styles.historyContent}>
          <Text style={styles.historyTitle}>
            Patrol History
          </Text>

          <Text style={styles.historyText}>
            View your previous patrol sessions
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dutyHistoryButton}
        onPress={() =>
          router.push('/tanod-duty-history')
        }
      >
        <Text style={styles.historyIcon}>
          🕒
        </Text>

        <View style={styles.historyContent}>
          <Text style={styles.historyTitle}>
            Duty History
          </Text>

          <Text style={styles.historyText}>
            View your previous duty records
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity>


      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5FA',
    padding: 20,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: '#F5F5FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#777',
    fontSize: 14,
    marginTop: 10,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 45,
    marginBottom: 25,
  },

  smallText: {
    color: '#777',
    fontSize: 14,
  },

  name: {
    color: '#30305F',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 3,
  },

  role: {
    color: '#7777B8',
    fontSize: 13,
    marginTop: 3,
    fontWeight: '600',
  },

  shield: {
    fontSize: 42,
  },

  dutyCard: {
    backgroundColor: '#7777B8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
  },

  dutyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  dutyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },

  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  dutyIcon: {
    fontSize: 38,
  },

  dutyButton: {
    backgroundColor: '#30305F',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },

  endDutyButton: {
    backgroundColor: '#8B2E2E',
  },

  dutyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  sectionTitle: {
    color: '#30305F',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    width: '31%',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
  },

  summaryIcon: {
    fontSize: 25,
    marginBottom: 8,
  },

  summaryNumber: {
    color: '#30305F',
    fontSize: 24,
    fontWeight: 'bold',
  },

  summaryLabel: {
    color: '#777',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 3,
  },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  actionCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },

  actionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },

  actionText: {
    color: '#30305F',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  historyButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 17,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  dutyHistoryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 17,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  historyIcon: {
    fontSize: 28,
    marginRight: 14,
  },

  historyContent: {
    flex: 1,
  },

  historyTitle: {
    color: '#30305F',
    fontSize: 15,
    fontWeight: 'bold',
  },

  historyText: {
    color: '#888',
    fontSize: 12,
    marginTop: 3,
  },

  arrow: {
    color: '#7777B8',
    fontSize: 30,
    fontWeight: '300',
  },

  logoutButton: {
    backgroundColor: '#8B2E2E',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  bottomSpace: {
    height: 40,
  },
});
