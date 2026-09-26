import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

type Incident = {
  id: string;
  reporter_id: string;
  assigned_tanod_id: string | null;
  incident_type: string;
  description: string;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function OfficerIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    setLoading(true);

    const { data, error } = await supabase
      .from('incidents')
      .select(`
        id,
        reporter_id,
        assigned_tanod_id,
        incident_type,
        description,
        photo_url,
        latitude,
        longitude,
        status,
        created_at,
        updated_at
      `)
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }

    setIncidents(data || []);
    setLoading(false);
  }

  function statusColor(status: string) {
    switch (status) {
      case 'reported':
        return '#D97706';

      case 'acknowledged':
        return '#2563EB';

      case 'in_progress':
        return '#7C3AED';

      case 'resolved':
        return '#21844A';

      default:
        return '#777';
    }
  }

  function statusText(status: string) {
    return status
      .replace('_', ' ')
      .toUpperCase();
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#6C3FC5"
        />

        <Text style={styles.loadingText}>
          Loading incident reports...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.title}>
              Incident Reports
            </Text>

            <Text style={styles.subtitle}>
              Monitor resident safety reports
            </Text>
          </View>

          <Text style={styles.headerIcon}>🚨</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {incidents.length}
          </Text>

          <Text style={styles.summaryText}>
            Total Incident Reports
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          All Reports
        </Text>

        {incidents.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              📭
            </Text>

            <Text style={styles.emptyTitle}>
              No Incident Reports
            </Text>

            <Text style={styles.emptyText}>
              No residents have reported an incident yet.
            </Text>
          </View>
        ) : (
          incidents.map((incident) => (
            <View
              key={incident.id}
              style={styles.incidentCard}
            >
              <View style={styles.topRow}>
                <View style={styles.typeContainer}>
                  <Text style={styles.incidentType}>
                    {incident.incident_type}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        statusColor(incident.status),
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {statusText(incident.status)}
                  </Text>
                </View>
              </View>

              <Text style={styles.description}>
                {incident.description}
              </Text>

              {incident.latitude !== null &&
                incident.longitude !== null && (
                  <View style={styles.locationBox}>
                    <Text style={styles.locationIcon}>
                      📍
                    </Text>

                    <Text style={styles.locationText}>
                      Location available
                    </Text>
                  </View>
                )}

              {incident.photo_url && (
                <View style={styles.photoBox}>
                  <Text style={styles.photoText}>
                    📷 Incident photo attached
                  </Text>
                </View>
              )}

              <View style={styles.bottomRow}>
                <Text style={styles.date}>
                  {new Date(
                    incident.created_at
                  ).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadIncidents}
        >
          <Text style={styles.refreshText}>
            ↻ Refresh Reports
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

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F5FC',
  },

  loadingText: {
    marginTop: 10,
    color: '#777',
  },

  header: {
    backgroundColor: '#6C3FC5',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    color: '#6C3FC5',
    fontSize: 32,
    lineHeight: 35,
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  subtitle: {
    color: '#EDE7FA',
    fontSize: 12,
    marginTop: 4,
  },

  headerIcon: {
    fontSize: 32,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },

  summaryNumber: {
    color: '#6C3FC5',
    fontSize: 32,
    fontWeight: '800',
  },

  summaryText: {
    color: '#777',
    fontSize: 13,
    marginTop: 4,
  },

  sectionTitle: {
    color: '#292133',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },

  incidentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  typeContainer: {
    flex: 1,
  },

  incidentType: {
    color: '#292133',
    fontSize: 16,
    fontWeight: '800',
  },

  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  statusText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  description: {
    color: '#555',
    fontSize: 13,
    lineHeight: 19,
  },

  locationBox: {
    backgroundColor: '#F1EDFA',
    borderRadius: 9,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  locationIcon: {
    fontSize: 15,
  },

  locationText: {
    color: '#6C3FC5',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },

  photoBox: {
    backgroundColor: '#F1EDFA',
    borderRadius: 9,
    padding: 9,
    marginTop: 8,
  },

  photoText: {
    color: '#6C3FC5',
    fontSize: 11,
    fontWeight: '700',
  },

  bottomRow: {
    marginTop: 10,
  },

  date: {
    color: '#999',
    fontSize: 10,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 38,
  },

  emptyTitle: {
    color: '#292133',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 8,
  },

  emptyText: {
    color: '#777',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },

  refreshButton: {
    backgroundColor: '#EEE9F8',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },

  refreshText: {
    color: '#6C3FC5',
    fontWeight: '800',
  },
});
