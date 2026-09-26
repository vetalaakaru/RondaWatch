import { useEffect, useState } from 'react';
import {
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

type Incident = {
  id: string;
  incident_type: string;
  description: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export default function TanodIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIncidents = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('incidents')
      .select(`
        id,
        incident_type,
        description,
        status,
        latitude,
        longitude,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setIncidents(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const formatDate = (value: string) => {
    return new Date(value).toLocaleString();
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Incidents</Text>

        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadIncidents}
          />
        }
      >

        {incidents.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>

            <Text style={styles.emptyTitle}>
              No Reported Incidents
            </Text>

            <Text style={styles.emptyText}>
              New resident reports will appear here.
            </Text>
          </View>
        ) : (
          incidents.map((incident) => (
            <TouchableOpacity
              key={incident.id}
              style={styles.card}
onPress={() =>
  router.push({
    pathname: '/tanod-incident-details',
    params: {
      id: incident.id,
    },
  })
}
            >

              <Text style={styles.type}>
                🚨 {incident.incident_type}
              </Text>

              <Text style={styles.description}>
                {incident.description}
              </Text>

              <Text style={styles.date}>
                Reported: {formatDate(incident.created_at)}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  incident.status === 'reported'
                    ? styles.reported
                    : incident.status === 'acknowledged'
                    ? styles.acknowledged
                    : incident.status === 'in_progress'
                    ? styles.progress
                    : styles.resolved,
                ]}
              >
                <Text style={styles.statusText}>
                  {incident.status
                    .replace('_', ' ')
                    .toUpperCase()}
                </Text>
              </View>

              {incident.latitude !== null &&
                incident.longitude !== null && (
                  <Text style={styles.location}>
                    📍 Location available
                  </Text>
                )}

            </TouchableOpacity>
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
    padding: 20,
  },

  header: {
    marginTop: 35,
    marginBottom: 20,
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
    padding: 18,
    marginBottom: 15,
  },

  type: {
    color: '#30305F',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  description: {
    color: '#555',
    fontSize: 15,
    marginBottom: 10,
  },

  date: {
    color: '#888',
    fontSize: 12,
    marginBottom: 12,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  reported: {
    backgroundColor: '#FFE0E0',
  },

  acknowledged: {
    backgroundColor: '#FFF0C2',
  },

  progress: {
    backgroundColor: '#DDE7FF',
  },

  resolved: {
    backgroundColor: '#DFF3E7',
  },

  statusText: {
    fontWeight: 'bold',
    fontSize: 11,
  },

  location: {
    color: '#7777B8',
    marginTop: 10,
    fontSize: 13,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
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
