import { router } from 'expo-router';
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
import { supabase } from '../../lib/supabase';

type Announcement = {
  id: string;
  title: string;
  message: string;
  created_at: string;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function ResidentDashboard() {
  const [name, setName] = useState('Resident');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] =
    useState(true);
  const [loadingNotifications, setLoadingNotifications] =
    useState(true);

  useEffect(() => {
    loadProfile();
    loadAnnouncements();
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 5000);

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );

    return () => {
      clearInterval(interval);
      backHandler.remove();
    };
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace('/login');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (error) {
      return;
    }

    if (data?.full_name) {
      setName(data.full_name);
    }
  }

  async function loadAnnouncements() {
    setLoadingAnnouncements(true);

    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, message, created_at')
      .order('created_at', {
        ascending: false,
      })
      .limit(5);

    if (error) {
      Alert.alert(
        'Announcements Error',
        error.message
      );
      setLoadingAnnouncements(false);
      return;
    }

    setAnnouncements(data ?? []);
    setLoadingAnnouncements(false);
  }

  async function loadNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .select(
        'id, title, message, type, is_read, created_at'
      )
      .eq('user_id', user.id)
      .order('created_at', {
        ascending: false,
      })
      .limit(10);

    if (error) {
      console.log(
        'Notifications Error:',
        error.message
      );
      return;
    }

    setNotifications(data ?? []);
    setLoadingNotifications(false);
  }

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('id', id);

    if (error) {
      Alert.alert(
        'Error',
        error.message
      );
      return;
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              is_read: true,
            }
          : notification
      )
    );
  }

  async function markAllAsRead() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      Alert.alert(
        'Error',
        error.message
      );
      return;
    }

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );
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

    router.replace('/');
  }

  function formatDate(dateString: string) {
    return new Date(
      dateString
    ).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatNotificationIcon(type: string) {
    if (type === 'incident') {
      return '🚨';
    }

    if (type === 'sos') {
      return '🆘';
    }

    if (type === 'patrol') {
      return '👮';
    }

    if (type === 'announcement') {
      return '📢';
    }

    return '🔔';
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

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
        </View>

        <View style={styles.headerRight}>
          <View style={styles.notificationIcon}>
            <Text style={styles.bell}>
              🔔
            </Text>

            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9
                    ? '9+'
                    : unreadCount}
                </Text>
              </View>
            )}
          </View>

          {/* Shield icon wrapped with TouchableOpacity to navigate to resident-profile */}
          <TouchableOpacity onPress={() => router.push('/resident-profile')}>
            <Text style={styles.shield}>
              🛡️
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>
          Barangay Safety Status
        </Text>

        <View style={styles.statusRow}>
          <View style={styles.greenDot} />

          <Text style={styles.statusText}>
            All systems active
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() =>
            router.push('/report')
          }
        >
          <Text style={styles.icon}>
            🚨
          </Text>

          <Text style={styles.actionText}>
            Report Incident
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() =>
            router.push('/sos')
          }
        >
          <Text style={styles.icon}>
            🆘
          </Text>

          <Text style={styles.actionText}>
            Emergency SOS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() =>
            router.push('/resident-map')
          }
        >
          <Text style={styles.icon}>
            🗺️
          </Text>

          <Text style={styles.actionText}>
            Barangay Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() =>
            router.push('/resident-chat')
          }
        >
          <Text style={styles.icon}>
            💬
          </Text>

          <Text style={styles.actionText}>
            Chat
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Notifications
        </Text>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={markAllAsRead}
          >
            <Text style={styles.refreshText}>
              Mark all as read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loadingNotifications ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator
            size="small"
            color="#7777B8"
          />

          <Text style={styles.loadingText}>
            Loading notifications...
          </Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>
            🔔
          </Text>

          <Text style={styles.emptyTitle}>
            No notifications
          </Text>

          <Text style={styles.emptyText}>
            Your notifications will appear here.
          </Text>
        </View>
      ) : (
        notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.is_read &&
                styles.unreadCard,
            ]}
            onPress={() => {
              if (!notification.is_read) {
                markAsRead(notification.id);
              }
            }}
          >
            <View style={styles.notificationIconBox}>
              <Text style={styles.notificationEmoji}>
                {formatNotificationIcon(
                  notification.type
                )}
              </Text>
            </View>

            <View style={styles.notificationContent}>
              <View style={styles.notificationTitleRow}>
                <Text
                  style={[
                    styles.notificationTitle,
                    !notification.is_read &&
                      styles.unreadTitle,
                  ]}
                >
                  {notification.title}
                </Text>

                {!notification.is_read && (
                  <View style={styles.unreadDot} />
                )}
              </View>

              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>

              <Text style={styles.notificationDate}>
                {formatDate(
                  notification.created_at
                )}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Recent Incidents
        </Text>
      </View>

      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>
          📋
        </Text>

        <Text style={styles.emptyTitle}>
          No recent incidents
        </Text>

        <Text style={styles.emptyText}>
          Reported incidents will appear here.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Safety Announcements
        </Text>

        <TouchableOpacity
          onPress={loadAnnouncements}
        >
          <Text style={styles.refreshText}>
            Refresh
          </Text>
        </TouchableOpacity>
      </View>

      {loadingAnnouncements ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator
            size="small"
            color="#7777B8"
          />

          <Text style={styles.loadingText}>
            Loading announcements...
          </Text>
        </View>
      ) : announcements.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>
            📢
          </Text>

          <Text style={styles.emptyTitle}>
            No announcements
          </Text>

          <Text style={styles.emptyText}>
            Safety announcements will appear here.
          </Text>
        </View>
      ) : (
        announcements.map((announcement) => (
          <View
            key={announcement.id}
            style={styles.announcementCard}
          >
            <View style={styles.announcementIcon}>
              <Text style={styles.announcementEmoji}>
                📢
              </Text>
            </View>

            <View style={styles.announcementContent}>
              <Text style={styles.announcementTitle}>
                {announcement.title}
              </Text>

              <Text style={styles.announcementMessage}>
                {announcement.message}
              </Text>

              <Text style={styles.announcementDate}>
                {formatDate(
                  announcement.created_at
                )}
              </Text>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
      >
        <Text style={styles.logoutText}>
          Logout
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

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationIcon: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    position: 'relative',
  },

  bell: {
    fontSize: 27,
  },

  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },

  shield: {
    fontSize: 42,
  },

  statusCard: {
    backgroundColor: '#7777B8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },

  statusTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5BE37D',
    marginRight: 8,
  },

  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    color: '#30305F',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  refreshText: {
    color: '#7777B8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
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

  icon: {
    fontSize: 32,
    marginBottom: 10,
  },

  actionText: {
    color: '#30305F',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
  },

  loadingText: {
    color: '#888',
    fontSize: 13,
    marginTop: 8,
  },

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
  },

  unreadCard: {
    backgroundColor: '#F0EFFB',
    borderWidth: 1,
    borderColor: '#DDDDF2',
  },

  notificationIconBox: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#E9E8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  notificationEmoji: {
    fontSize: 22,
  },

  notificationContent: {
    flex: 1,
  },

  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  notificationTitle: {
    color: '#30305F',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },

  unreadTitle: {
    fontWeight: 'bold',
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7777B8',
    marginLeft: 8,
  },

  notificationMessage: {
    color: '#666',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },

  notificationDate: {
    color: '#999',
    fontSize: 11,
    marginTop: 8,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
  },

  emptyIcon: {
    fontSize: 35,
    marginBottom: 8,
  },

  emptyTitle: {
    color: '#30305F',
    fontSize: 16,
    fontWeight: 'bold',
  },

  emptyText: {
    color: '#888',
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  },

  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
  },

  announcementIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#E9E8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  announcementEmoji: {
    fontSize: 22,
  },

  announcementContent: {
    flex: 1,
  },

  announcementTitle: {
    color: '#30305F',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  announcementMessage: {
    color: '#666',
    fontSize: 13,
    lineHeight: 19,
  },

  announcementDate: {
    color: '#999',
    fontSize: 11,
    marginTop: 8,
  },

  logoutButton: {
    backgroundColor: '#30305F',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
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