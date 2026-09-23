import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function TanodSOS() {
  const [sosStatus, setSosStatus] = useState<
    "active" | "responding" | "resolved"
  >("active");

  const handleRespond = () => {
    setSosStatus("responding");

    Alert.alert(
      "SOS Response",
      "You are now responding to this emergency alert."
    );
  };

  const handleResolve = () => {
    setSosStatus("resolved");

    Alert.alert(
      "Emergency Resolved",
      "The emergency has been marked as resolved."
    );
  };

  const handleViewLocation = () => {
    Alert.alert(
      "Emergency Location",
      "Emergency location: Zone 2, Purok Apokon."
    );
  };

  const getStatusText = () => {
    if (sosStatus === "active") return "ACTIVE SOS";
    if (sosStatus === "responding") return "RESPONDING";
    return "RESOLVED";
  };

  const getStatusColor = () => {
    if (sosStatus === "active") return "#D94343";
    if (sosStatus === "responding") return "#F0A62B";
    return "#27AE60";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#35358D"
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.smallText}>
            Barangay Tanod Portal
          </Text>

          <Text style={styles.title}>
            Emergency / SOS
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="alert-circle"
            size={23}
            color="#D94343"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* EMERGENCY HEADER */}
        <View style={styles.emergencyHeader}>
          <View style={styles.sosCircle}>
            <Ionicons
              name="warning"
              size={34}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.emergencyTitle}>
            Emergency Response
          </Text>

          <Text style={styles.emergencySubtitle}>
            Monitor and respond to resident SOS alerts
          </Text>
        </View>

        {/* ACTIVE ALERT */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Active Emergency
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  getStatusColor() === "#D94343"
                    ? "#FDEAEA"
                    : getStatusColor() === "#F0A62B"
                    ? "#FFF4DE"
                    : "#E5F7EA",
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: getStatusColor(),
                },
              ]}
            />

            <Text
              style={[
                styles.statusBadgeText,
                {
                  color: getStatusColor(),
                },
              ]}
            >
              {getStatusText()}
            </Text>
          </View>
        </View>

        <View style={styles.alertCard}>
          {/* ALERT TOP */}
          <View style={styles.alertTop}>
            <View style={styles.residentIcon}>
              <Ionicons
                name="person"
                size={23}
                color="#D94343"
              />
            </View>

            <View style={styles.residentInfo}>
              <Text style={styles.residentName}>
                Juan Dela Cruz
              </Text>

              <Text style={styles.residentLabel}>
                Resident
              </Text>
            </View>

            <View style={styles.alertIcon}>
              <Ionicons
                name="notifications"
                size={19}
                color="#D94343"
              />
            </View>
          </View>

          {/* EMERGENCY TYPE */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="warning-outline"
                size={18}
                color="#D94343"
              />
            </View>

            <View>
              <Text style={styles.infoLabel}>
                Emergency Type
              </Text>

              <Text style={styles.infoValue}>
                Medical Emergency
              </Text>
            </View>
          </View>

          {/* LOCATION */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="location-outline"
                size={18}
                color="#5A51E8"
              />
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>
                Location
              </Text>

              <Text style={styles.infoValue}>
                Zone 2, Purok Apokon
              </Text>
            </View>
          </View>

          {/* TIME */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="time-outline"
                size={18}
                color="#777"
              />
            </View>

            <View>
              <Text style={styles.infoLabel}>
                Alert Received
              </Text>

              <Text style={styles.infoValue}>
                2 minutes ago
              </Text>
            </View>
          </View>

          {/* LOCATION BUTTON */}
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleViewLocation}
          >
            <Ionicons
              name="map-outline"
              size={19}
              color="#5A51E8"
            />

            <Text style={styles.locationButtonText}>
              VIEW LOCATION
            </Text>
          </TouchableOpacity>
        </View>

        {/* RESPONSE ACTIONS */}
        <Text style={styles.sectionTitle}>
          Response Actions
        </Text>

        {sosStatus === "active" && (
          <TouchableOpacity
            style={styles.respondButton}
            onPress={handleRespond}
          >
            <Ionicons
              name="navigate"
              size={21}
              color="#FFFFFF"
            />

            <Text style={styles.respondButtonText}>
              RESPOND TO SOS
            </Text>
          </TouchableOpacity>
        )}

        {sosStatus === "responding" && (
          <>
            <View style={styles.respondingCard}>
              <View style={styles.respondingIcon}>
                <Ionicons
                  name="navigate"
                  size={24}
                  color="#F0A62B"
                />
              </View>

              <View style={styles.respondingContent}>
                <Text style={styles.respondingTitle}>
                  You are responding
                </Text>

                <Text style={styles.respondingText}>
                  Proceed to the emergency location
                  and assist the resident.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.resolveButton}
              onPress={handleResolve}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.resolveButtonText}>
                MARK AS RESOLVED
              </Text>
            </TouchableOpacity>
          </>
        )}

        {sosStatus === "resolved" && (
          <View style={styles.resolvedCard}>
            <View style={styles.resolvedIcon}>
              <Ionicons
                name="checkmark-circle"
                size={28}
                color="#27AE60"
              />
            </View>

            <View style={styles.resolvedContent}>
              <Text style={styles.resolvedTitle}>
                Emergency Resolved
              </Text>

              <Text style={styles.resolvedText}>
                This emergency alert has been handled
                successfully.
              </Text>
            </View>
          </View>
        )}

        {/* EMERGENCY HISTORY */}
        <Text style={styles.sectionTitle}>
          Emergency History
        </Text>

        <View style={styles.historyCard}>
          <View style={styles.historyIcon}>
            <Ionicons
              name="checkmark"
              size={19}
              color="#27AE60"
            />
          </View>

          <View style={styles.historyContent}>
            <Text style={styles.historyTitle}>
              Medical Emergency
            </Text>

            <Text style={styles.historyLocation}>
              Zone 1, Purok Apokon
            </Text>

            <Text style={styles.historyTime}>
              Yesterday • 8:42 PM
            </Text>
          </View>

          <View style={styles.resolvedBadge}>
            <Text style={styles.resolvedBadgeText}>
              RESOLVED
            </Text>
          </View>
        </View>

        <View style={styles.historyCard}>
          <View style={styles.historyIcon}>
            <Ionicons
              name="checkmark"
              size={19}
              color="#27AE60"
            />
          </View>

          <View style={styles.historyContent}>
            <Text style={styles.historyTitle}>
              Security Concern
            </Text>

            <Text style={styles.historyLocation}>
              Main Road, Purok Apokon
            </Text>

            <Text style={styles.historyTime}>
              Sept. 22 • 10:15 PM
            </Text>
          </View>

          <View style={styles.resolvedBadge}>
            <Text style={styles.resolvedBadgeText}>
              RESOLVED
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FC",
  },

  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  smallText: {
    fontSize: 11,
    color: "#888",
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#35358D",
    marginTop: 2,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FDEAEA",
    justifyContent: "center",
    alignItems: "center",
  },

  scroll: {
    padding: 18,
    paddingBottom: 35,
  },

  emergencyHeader: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    elevation: 2,
  },

  sosCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#D94343",
    justifyContent: "center",
    alignItems: "center",
  },

  emergencyTitle: {
    color: "#35358D",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 11,
  },

  emergencySubtitle: {
    color: "#888",
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#35358D",
    marginTop: 22,
    marginBottom: 11,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },

  statusBadgeText: {
    fontSize: 8,
    fontWeight: "800",
  },

  alertCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#D94343",
  },

  alertTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  residentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FDEAEA",
    justifyContent: "center",
    alignItems: "center",
  },

  residentInfo: {
    flex: 1,
    marginLeft: 11,
  },

  residentName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333",
  },

  residentLabel: {
    color: "#999",
    fontSize: 10,
    marginTop: 3,
  },

  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FDEAEA",
    justifyContent: "center",
    alignItems: "center",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  infoTextContainer: {
    flex: 1,
  },

  infoLabel: {
    color: "#999",
    fontSize: 9,
  },

  infoValue: {
    color: "#333",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  locationButton: {
    height: 47,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#5A51E8",
    backgroundColor: "#F8F7FF",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 17,
  },

  locationButtonText: {
    color: "#5A51E8",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 7,
  },

  respondButton: {
    height: 55,
    borderRadius: 14,
    backgroundColor: "#D94343",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  respondButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  respondingCard: {
    backgroundColor: "#FFF8E9",
    borderRadius: 15,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F4D99B",
  },

  respondingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF0CC",
    justifyContent: "center",
    alignItems: "center",
  },

  respondingContent: {
    flex: 1,
    marginLeft: 11,
  },

  respondingTitle: {
    color: "#A66A00",
    fontSize: 13,
    fontWeight: "800",
  },

  respondingText: {
    color: "#8A754F",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  resolveButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#27AE60",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
  },

  resolveButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },

  resolvedCard: {
    backgroundColor: "#E5F7EA",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  resolvedIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  resolvedContent: {
    flex: 1,
    marginLeft: 11,
  },

  resolvedTitle: {
    color: "#24944A",
    fontSize: 14,
    fontWeight: "800",
  },

  resolvedText: {
    color: "#5F866A",
    fontSize: 10,
    marginTop: 3,
  },

  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    elevation: 1,
  },

  historyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E5F7EA",
    justifyContent: "center",
    alignItems: "center",
  },

  historyContent: {
    flex: 1,
    marginLeft: 11,
  },

  historyTitle: {
    color: "#333",
    fontSize: 13,
    fontWeight: "800",
  },

  historyLocation: {
    color: "#777",
    fontSize: 10,
    marginTop: 3,
  },

  historyTime: {
    color: "#999",
    fontSize: 9,
    marginTop: 3,
  },

  resolvedBadge: {
    backgroundColor: "#E5F7EA",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },

  resolvedBadgeText: {
    color: "#24944A",
    fontSize: 8,
    fontWeight: "800",
  },
});