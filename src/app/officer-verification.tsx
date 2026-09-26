import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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
  tanod_id_number: string | null;
  verification_status: string;
  id_photo_url: string | null;
  full_name: string;
  phone: string | null;
};

export default function OfficerVerification() {
  const [tanods, setTanods] = useState<Tanod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTanod, setSelectedTanod] = useState<Tanod | null>(null);
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadTanods();
  }, []);

  async function loadTanods() {
    setLoading(true);

    const { data, error } = await supabase
      .from('tanod_profiles')
      .select(`
        id,
        tanod_id_number,
        verification_status,
        id_photo_url,
        profiles!inner (
          full_name,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }

    const formatted = (data || []).map((item: any) => ({
      id: item.id,
      tanod_id_number: item.tanod_id_number,
      verification_status: item.verification_status,
      id_photo_url: item.id_photo_url,
      full_name: item.profiles?.full_name || 'Unknown Tanod',
      phone: item.profiles?.phone || null,
    }));

    setTanods(formatted);
    setLoading(false);
  }

  async function openTanod(tanod: Tanod) {
    setSelectedTanod(tanod);
    setIdPhoto(null);

    if (!tanod.id_photo_url) {
      return;
    }

    const { data, error } = await supabase.storage
      .from('tanod-ids')
      .createSignedUrl(tanod.id_photo_url, 3600);

    if (!error && data?.signedUrl) {
      setIdPhoto(data.signedUrl);
    }
  }

  async function updateVerification(
    tanodId: string,
    status: 'approved' | 'rejected'
  ) {
    Alert.alert(
      status === 'approved' ? 'Approve Tanod' : 'Reject Tanod',
      status === 'approved'
        ? 'Are you sure you want to approve this Tanod?'
        : 'Are you sure you want to reject this Tanod?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: status === 'approved' ? 'Approve' : 'Reject',
          style: status === 'approved' ? 'default' : 'destructive',
          onPress: async () => {
            setProcessing(true);

            const { error } = await supabase
              .from('tanod_profiles')
              .update({
                verification_status: status,
              })
              .eq('id', tanodId);

            if (error) {
              Alert.alert('Error', error.message);
              setProcessing(false);
              return;
            }

            setSelectedTanod(null);
            setIdPhoto(null);
            await loadTanods();

            setProcessing(false);

            Alert.alert(
              'Success',
              status === 'approved'
                ? 'Tanod has been approved.'
                : 'Tanod has been rejected.'
            );
          },
        },
      ]
    );
  }

  const pending = tanods.filter(
    (item) => item.verification_status === 'pending'
  );

  const approved = tanods.filter(
    (item) => item.verification_status === 'approved'
  );

  const rejected = tanods.filter(
    (item) => item.verification_status === 'rejected'
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6C3FC5" />
        <Text style={styles.loadingText}>
          Loading Tanod verification...
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
            <Text style={styles.title}>Tanod Verification</Text>
            <Text style={styles.subtitle}>
              Review registered Tanod accounts
            </Text>
          </View>

          <Text style={styles.headerIcon}>👮</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pending.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{approved.length}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{rejected.length}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Pending Verification
        </Text>

        {pending.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>
              No Pending Tanods
            </Text>
            <Text style={styles.emptyText}>
              All Tanod registrations have been reviewed.
            </Text>
          </View>
        ) : (
          pending.map((tanod) => (
            <TouchableOpacity
              key={tanod.id}
              style={styles.tanodCard}
              activeOpacity={0.75}
              onPress={() => openTanod(tanod)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {tanod.full_name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.tanodInfo}>
                <Text style={styles.name}>
                  {tanod.full_name}
                </Text>

                <Text style={styles.phone}>
                  {tanod.phone || 'No phone number'}
                </Text>

                <Text style={styles.idNumber}>
                  Tanod ID:{' '}
                  {tanod.tanod_id_number || 'Not provided'}
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))
        )}

        <Text style={styles.sectionTitle}>
          Approved Tanods
        </Text>

        {approved.map((tanod) => (
          <TouchableOpacity
            key={tanod.id}
            style={styles.tanodCard}
            activeOpacity={0.75}
            onPress={() => openTanod(tanod)}
          >
            <View style={styles.avatarApproved}>
              <Text style={styles.avatarText}>✓</Text>
            </View>

            <View style={styles.tanodInfo}>
              <Text style={styles.name}>
                {tanod.full_name}
              </Text>

              <Text style={styles.phone}>
                {tanod.phone || 'No phone number'}
              </Text>
            </View>

            <View style={styles.approvedBadge}>
              <Text style={styles.approvedText}>APPROVED</Text>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>
          Rejected Tanods
        </Text>

        {rejected.map((tanod) => (
          <TouchableOpacity
            key={tanod.id}
            style={styles.tanodCard}
            activeOpacity={0.75}
            onPress={() => openTanod(tanod)}
          >
            <View style={styles.avatarRejected}>
              <Text style={styles.avatarText}>!</Text>
            </View>

            <View style={styles.tanodInfo}>
              <Text style={styles.name}>
                {tanod.full_name}
              </Text>

              <Text style={styles.phone}>
                {tanod.phone || 'No phone number'}
              </Text>
            </View>

            <View style={styles.rejectedBadge}>
              <Text style={styles.rejectedText}>REJECTED</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={selectedTanod !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTanod(null)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                Tanod Details
              </Text>

              {selectedTanod && (
                <>
                  <Text style={styles.detailLabel}>
                    Full Name
                  </Text>
                  <Text style={styles.detailValue}>
                    {selectedTanod.full_name}
                  </Text>

                  <Text style={styles.detailLabel}>
                    Phone
                  </Text>
                  <Text style={styles.detailValue}>
                    {selectedTanod.phone || 'No phone number'}
                  </Text>

                  <Text style={styles.detailLabel}>
                    Tanod ID Number
                  </Text>
                  <Text style={styles.detailValue}>
                    {selectedTanod.tanod_id_number ||
                      'Not provided'}
                  </Text>

                  <Text style={styles.detailLabel}>
                    Verification Status
                  </Text>
                  <Text style={styles.detailValue}>
                    {selectedTanod.verification_status
                      .toUpperCase()}
                  </Text>

                  <Text style={styles.detailLabel}>
                    Tanod ID Photo
                  </Text>

                  {idPhoto ? (
                    <Image
                      source={{ uri: idPhoto }}
                      style={styles.idImage}
                    />
                  ) : (
                    <View style={styles.noPhoto}>
                      <Text style={styles.noPhotoText}>
                        No ID photo available
                      </Text>
                    </View>
                  )}

                  {selectedTanod.verification_status ===
                    'pending' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        disabled={processing}
                        onPress={() =>
                          updateVerification(
                            selectedTanod.id,
                            'rejected'
                          )
                        }
                      >
                        <Text style={styles.actionText}>
                          Reject
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.approveButton}
                        disabled={processing}
                        onPress={() =>
                          updateVerification(
                            selectedTanod.id,
                            'approved'
                          )
                        }
                      >
                        <Text style={styles.actionText}>
                          Approve
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedTanod(null)}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    fontSize: 20,
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    color: '#6C3FC5',
    fontSize: 23,
    fontWeight: '800',
  },
  statLabel: {
    color: '#777',
    fontSize: 11,
    marginTop: 3,
  },
  sectionTitle: {
    color: '#292133',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 5,
  },
  tanodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#EEE4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarApproved: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#E5F7EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRejected: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FDE8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#6C3FC5',
    fontSize: 18,
    fontWeight: '800',
  },
  tanodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: '#292133',
    fontSize: 15,
    fontWeight: '800',
  },
  phone: {
    color: '#777',
    fontSize: 12,
    marginTop: 3,
  },
  idNumber: {
    color: '#6C3FC5',
    fontSize: 11,
    marginTop: 3,
  },
  arrow: {
    color: '#6C3FC5',
    fontSize: 30,
  },
  approvedBadge: {
    backgroundColor: '#E5F7EC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  approvedText: {
    color: '#21844A',
    fontSize: 9,
    fontWeight: '800',
  },
  rejectedBadge: {
    backgroundColor: '#FDE8E8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  rejectedText: {
    color: '#C53030',
    fontSize: 9,
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 35,
  },
  emptyTitle: {
    color: '#292133',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  emptyText: {
    color: '#777',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 22,
    maxHeight: '90%',
  },
  modalTitle: {
    color: '#292133',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 20,
  },
  detailLabel: {
    color: '#777',
    fontSize: 12,
    marginTop: 10,
  },
  detailValue: {
    color: '#292133',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 3,
  },
  idImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginTop: 10,
    resizeMode: 'contain',
    backgroundColor: '#F5F5F5',
  },
  noPhoto: {
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  noPhotoText: {
    color: '#888',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#D64545',
    borderRadius: 13,
    padding: 15,
    alignItems: 'center',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#21844A',
    borderRadius: 13,
    padding: 15,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  closeButton: {
    backgroundColor: '#EEE9F8',
    borderRadius: 13,
    padding: 15,
    alignItems: 'center',
    marginTop: 12,
  },
  closeText: {
    color: '#6C3FC5',
    fontWeight: '800',
  },
});
