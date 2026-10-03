import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

type Tanod = {
  id: string;
  full_name: string;
  phone: string | null;
};

type PatrolRoute = {
  id: string;
  route_name: string;
  description: string | null;
};

export default function OfficerDashboard() {
  const [officerName, setOfficerName] = useState('');
  const [pendingTanods, setPendingTanods] = useState(0);
  const [tanods, setTanods] = useState<Tanod[]>([]);
  const [routes, setRoutes] = useState<PatrolRoute[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'barangay_officer') {
        Alert.alert(
          'Access Denied',
          'Officer account required.'
        );
        router.replace('/login');
        return;
      }

      setOfficerName(
        profile.full_name || 'Barangay Officer'
      );

      const { data: pendingData } = await supabase
        .from('tanod_profiles')
        .select('id', { count: 'exact' })
        .eq('verification_status', 'pending');

      setPendingTanods(
        pendingData?.length || 0
      );

      const { data: tanodData } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .eq('role', 'tanod')
        .order('full_name', {
          ascending: true,
        });

      setTanods(tanodData || []);

      const { data: routeData } = await supabase
        .from('patrol_routes')
        .select(
          'id, route_name, description'
        )
        .order('created_at', {
          ascending: false,
        });

      setRoutes(routeData || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    const backHandler =
      BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          return true;
        }
      );

    return () => {
      backHandler.remove();
    };
  }, [loadDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const logout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const { error } =
              await supabase.auth.signOut();

            if (error) {
              Alert.alert(
                'Logout Failed',
                error.message
              );
              return;
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#6C3FC5"
        />

        <Text style={styles.loadingText}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.smallTitle}>
              BARANGAY OFFICER
            </Text>

            <Text style={styles.title}>
              Welcome, {officerName}
            </Text>

            <Text style={styles.subtitle}>
              Manage barangay safety operations
            </Text>
          </View>

          <Text style={styles.headerIcon}>
            🛡️
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {pendingTanods}
            </Text>

            <Text style={styles.statLabel}>
              Pending Tanods
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {tanods.length}
            </Text>

            <Text style={styles.statLabel}>
              Tanods
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {routes.length}
            </Text>

            <Text style={styles.statLabel}>
              Routes
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Management
        </Text>

        <TouchableOpacity
          style={styles.infoCard}
          activeOpacity={0.75}
          onPress={() =>
            router.push('/officer-verification')
          }
        >
          <View style={styles.iconBox}>
            <Text style={styles.infoIcon}>
              👮
            </Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Tanod Verification
            </Text>

            <Text style={styles.infoText}>
              Review and approve registered Tanods
            </Text>

            <Text style={styles.pendingText}>
              {pendingTanods} pending verification
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoCard}
          activeOpacity={0.75}
          onPress={() =>
            router.push('/officer-patrol')
          }
        >
          <View style={styles.iconBox}>
            <Text style={styles.infoIcon}>
              🛣️
            </Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Patrol Routes
            </Text>

            <Text style={styles.infoText}>
              Create routes and assign Tanods
            </Text>

            <Text style={styles.pendingText}>
              {routes.length} patrol routes
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoCard}
          activeOpacity={0.75}
          onPress={() =>
            router.push('/officer-incidents')
          }
        >
          <View style={styles.iconBox}>
            <Text style={styles.infoIcon}>
              🚨
            </Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Incident Reports
            </Text>

            <Text style={styles.infoText}>
              View and monitor reported incidents
            </Text>

            <Text style={styles.pendingText}>
              Manage resident reports
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.announcementButton}
          activeOpacity={0.8}
          onPress={() =>
            router.push('/officer-announcement')
          }
        >
          <Text style={styles.announcementIcon}>
            📢
          </Text>

          <View style={styles.announcementContent}>
            <Text style={styles.announcementTitle}>
              Safety Announcements
            </Text>

            <Text style={styles.announcementText}>
              Create and post barangay announcements
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>
          Registered Tanods
        </Text>

        {tanods.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              👮
            </Text>

            <Text style={styles.emptyText}>
              No Tanods registered yet.
            </Text>
          </View>
        ) : (
          tanods.map((tanod) => (
            <View
              key={tanod.id}
              style={styles.tanodCard}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {tanod.full_name
                    ? tanod.full_name
                        .charAt(0)
                        .toUpperCase()
                    : 'T'}
                </Text>
              </View>

              <View style={styles.tanodInfo}>
                <Text style={styles.tanodName}>
                  {tanod.full_name}
                </Text>

                <Text style={styles.tanodPhone}>
                  {tanod.phone ||
                    'No phone number'}
                </Text>
              </View>

              <Text style={styles.verifiedBadge}>
                Tanod
              </Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>
          Patrol Routes
        </Text>

        {routes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🛣️
            </Text>

            <Text style={styles.emptyText}>
              No patrol routes created yet.
            </Text>
          </View>
        ) : (
          routes.map((route) => (
            <View
              key={route.id}
              style={styles.routeCard}
            >
              <Text style={styles.routeIcon}>
                📍
              </Text>

              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>
                  {route.route_name}
                </Text>

                <Text
                  style={styles.routeDescription}
                >
                  {route.description ||
                    'No description'}
                </Text>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.refreshButton}
          activeOpacity={0.8}
          onPress={onRefresh}
        >
          <Text style={styles.refreshText}>
            ↻ Refresh Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={logout}
        >
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5FC',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F5FC',
  },

  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 15,
  },

  header: {
    backgroundColor: '#6C3FC5',
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallTitle: {
    color: '#E9DFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },

  subtitle: {
    color: '#EDE7FA',
    fontSize: 13,
    marginTop: 5,
  },

  headerIcon: {
    fontSize: 42,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    elevation: 2,
  },

  statNumber: {
    color: '#6C3FC5',
    fontSize: 25,
    fontWeight: '800',
  },

  statLabel: {
    color: '#777',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#292133',
    marginBottom: 10,
    marginTop: 5,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#F0EAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoIcon: {
    fontSize: 25,
  },

  infoContent: {
    flex: 1,
    marginLeft: 13,
    marginRight: 8,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#292133',
  },

  infoText: {
    color: '#777',
    fontSize: 12,
    marginTop: 3,
  },

  pendingText: {
    color: '#6C3FC5',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },

  arrow: {
    color: '#6C3FC5',
    fontSize: 30,
    fontWeight: '300',
  },

  announcementButton: {
    backgroundColor: '#6C3FC5',
    borderRadius: 18,
    padding: 17,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },

  announcementIcon: {
    fontSize: 25,
  },

  announcementContent: {
    flex: 1,
    marginLeft: 13,
  },

  announcementTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  announcementText: {
    color: '#EDE7FA',
    fontSize: 12,
    marginTop: 3,
  },

  tanodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#E9DEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#6C3FC5',
    fontSize: 19,
    fontWeight: '800',
  },

  tanodInfo: {
    flex: 1,
    marginLeft: 12,
  },

  tanodName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#292133',
  },

  tanodPhone: {
    color: '#777',
    fontSize: 12,
    marginTop: 3,
  },

  verifiedBadge: {
    backgroundColor: '#E8F7EE',
    color: '#21844A',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: '700',
  },

  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },

  routeIcon: {
    fontSize: 25,
  },

  routeInfo: {
    flex: 1,
    marginLeft: 12,
  },

  routeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#292133',
  },

  routeDescription: {
    color: '#777',
    fontSize: 12,
    marginTop: 3,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 25,
    marginBottom: 15,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 30,
    marginBottom: 8,
  },

  emptyText: {
    color: '#777',
    fontSize: 13,
  },

  refreshButton: {
    backgroundColor: '#EEE9F8',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 12,
  },

  refreshText: {
    color: '#6C3FC5',
    fontSize: 14,
    fontWeight: '700',
  },

  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DDEB',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 12,
  },

  logoutText: {
    color: '#D64545',
    fontSize: 14,
    fontWeight: '700',
  },
});
