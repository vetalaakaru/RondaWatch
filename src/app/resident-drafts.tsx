import { useCallback, useState } from 'react';
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
import { router, useFocusEffect } from 'expo-router';
import {
  deleteIncidentDraft,
  getIncidentDrafts,
  IncidentDraft,
} from '../../lib/offlineDrafts';

export default function ResidentDrafts() {
  const [drafts, setDrafts] = useState<IncidentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDrafts = async () => {
    try {
      const data = await getIncidentDrafts();
      setDrafts(data);
    } catch (error: any) {
      console.log(
        'Load drafts error:',
        error?.message || error
      );

      Alert.alert(
        'Error',
        'Unable to load your saved drafts.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDrafts();
    }, [])
  );

  const refreshDrafts = async () => {
    setRefreshing(true);
    await loadDrafts();
  };

  const removeDraft = (draft: IncidentDraft) => {
    Alert.alert(
      'Delete Draft',
      'Are you sure you want to delete this draft?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIncidentDraft(draft.id);
              await loadDrafts();
            } catch (error: any) {
              Alert.alert(
                'Delete Failed',
                error?.message ||
                  'Unable to delete this draft.'
              );
            }
          },
        },
      ]
    );
  };

  const editDraft = (draft: IncidentDraft) => {
    router.push({
      pathname: '/report',
      params: {
        draftId: String(draft.id),
      },
    });
  };

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Unknown date';
    }

    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.replace('/resident')
          }
        >
          <Text style={styles.back}>
            ‹ Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          My Drafts
        </Text>

        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#30305F"
          />

          <Text style={styles.loadingText}>
            Loading drafts...
          </Text>
        </View>
      ) : drafts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>
            📝
          </Text>

          <Text style={styles.emptyTitle}>
            No Saved Drafts
          </Text>

          <Text style={styles.emptyText}>
            Incident reports that you save
            while offline will appear here.
          </Text>

          <TouchableOpacity
            style={styles.reportButton}
            onPress={() =>
              router.push('/report')
            }
          >
            <Text style={styles.reportButtonText}>
              Report an Incident
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshDrafts}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              📱 Offline Drafts
            </Text>

            <Text style={styles.infoText}>
              These reports are saved on your
              device. They have not been sent to
              the barangay yet.
            </Text>
          </View>

          {drafts.map((draft) => (
            <View
              key={draft.id}
              style={styles.draftCard}
            >
              <View style={styles.draftHeader}>
                <Text style={styles.incidentType}>
                  {draft.incidentType}
                </Text>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    DRAFT
                  </Text>
                </View>
              </View>

              <Text style={styles.description}>
                {draft.description}
              </Text>

              <View style={styles.details}>
                <Text style={styles.detailText}>
                  🕒 {formatDate(draft.updatedAt)}
                </Text>

                <Text style={styles.detailText}>
                  📷{' '}
                  {draft.photoUri
                    ? 'Photo attached'
                    : 'No photo'}
                </Text>

                <Text style={styles.detailText}>
                  📍{' '}
                  {draft.latitude !== null &&
                  draft.longitude !== null
                    ? 'Location saved'
                    : 'No location'}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    editDraft(draft)
                  }
                >
                  <Text style={styles.editText}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    removeDraft(draft)
                  }
                >
                  <Text style={styles.deleteText}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
    fontSize: 21,
    fontWeight: 'bold',
    color: '#333',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#777',
    fontSize: 14,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  infoCard: {
    backgroundColor: '#F0F0F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },

  infoTitle: {
    color: '#30305F',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  infoText: {
    color: '#666',
    fontSize: 13,
    lineHeight: 19,
  },

  draftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
  },

  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  incidentType: {
    flex: 1,
    color: '#30305F',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },

  statusBadge: {
    backgroundColor: '#E8E8F5',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  statusText: {
    color: '#55558F',
    fontSize: 11,
    fontWeight: 'bold',
  },

  description: {
    color: '#444',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 14,
  },

  details: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEF5',
    paddingTop: 12,
    gap: 6,
  },

  detailText: {
    color: '#777',
    fontSize: 13,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#7777B8',
    borderRadius: 9,
    paddingVertical: 11,
    alignItems: 'center',
  },

  editText: {
    color: '#55558F',
    fontWeight: 'bold',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#FBEAEA',
    borderRadius: 9,
    paddingVertical: 11,
    alignItems: 'center',
  },

  deleteText: {
    color: '#C0392B',
    fontWeight: 'bold',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginTop: 30,
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#30305F',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  emptyText: {
    color: '#777',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },

  reportButton: {
    backgroundColor: '#30305F',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 20,
  },

  reportButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
