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

export default function TanodPatrol() {
  const [patrolStarted, setPatrolStarted] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const togglePatrol = () => {
    if (!patrolStarted) {
      setPatrolStarted(true);

      Alert.alert(
        "Patrol Started",
        "Your patrol has started. Your patrol activity is now active."
      );
    } else {
      setPatrolStarted(false);

      Alert.alert(
        "Patrol Ended",
        "Your patrol has been successfully ended."
      );
    }
  };

  const handleCheckIn = () => {
    setCheckedIn(true);

    Alert.alert(
      "Patrol Check-In",
      "Your current patrol location has been recorded."
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={23} color="#35358D" />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.smallText}>Barangay Tanod Portal</Text>
          <Text style={styles.title}>Patrol</Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="navigate"
            size={22}
            color="#5A51E8"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* PATROL STATUS */}
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons
              name={patrolStarted ? "walk" : "pause"}
              size={27}
              color="#5A51E8"
            />
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>Patrol Status</Text>

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: patrolStarted
                      ? "#27AE60"
                      : "#999",
                  },
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  {
                    color: patrolStarted
                      ? "#27AE60"
                      : "#777",
                  },
                ]}
              >
                {patrolStarted ? "PATROL ACTIVE" : "PATROL NOT STARTED"}
              </Text>
            </View>
          </View>
        </View>

        {/* TODAY'S ASSIGNMENT */}
        <Text style={styles.sectionTitle}>
          Today's Patrol
        </Text>

        <View style={styles.assignmentCard}>
          <View style={styles.assignmentTop}>
            <View style={styles.routeIcon}>
              <Ionicons
                name="navigate"
                size={25}
                color="#5A51E8"
              />
            </View>

            <View style={styles.assignmentContent}>
              <Text style={styles.assignmentTitle}>
                Patrol Route A
              </Text>

              <Text style={styles.assignmentDescription}>
                Assigned patrol route
              </Text>
            </View>

            <View style={styles.assignedBadge}>
              <Text style={styles.assignedText}>
                ASSIGNED
              </Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <Ionicons
              name="location-outline"
              size={17}
              color="#777"
            />

            <Text style={styles.routeText}>
              Zone 1 → Zone 2 → Main Road
            </Text>
          </View>

          <View style={styles.routeRow}>
            <Ionicons
              name="time-outline"
              size={17}
              color="#777"
            />

            <Text style={styles.routeText}>
              6:00 PM - 10:00 PM
            </Text>
          </View>
        </View>

        {/* PATROL MAP */}
        <Text style={styles.sectionTitle}>
          Patrol Area
        </Text>

        <View style={styles.mapCard}>
          <View style={styles.mapBackground}>
            {/* Roads */}
            <View style={styles.mapRoad1} />
            <View style={styles.mapRoad2} />
            <View style={styles.mapRoad3} />
            <View style={styles.mapRoad4} />

            {/* Patrol route */}
            <View style={styles.routeLine} />

            {/* Locations */}
            <View style={styles.zoneOne}>
              <Ionicons
                name="location"
                size={29}
                color="#5A51E8"
              />
            </View>

            <View style={styles.zoneTwo}>
              <Ionicons
                name="location"
                size={29}
                color="#F0A62B"
              />
            </View>

            <View style={styles.mainRoad}>
              <Ionicons
                name="location"
                size={29}
                color="#D94343"
              />
            </View>

            {/* Current location */}
            {patrolStarted && (
              <View style={styles.currentLocation}>
                <View style={styles.currentDot} />
              </View>
            )}

            <View style={styles.mapLabel}>
              <Ionicons
                name="navigate"
                size={15}
                color="#5A51E8"
              />

              <Text style={styles.mapLabelText}>
                Assigned Patrol Route
              </Text>
            </View>
          </View>

          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: "#5A51E8" },
                ]}
              />
              <Text style={styles.legendText}>
                Zone 1
              </Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: "#F0A62B" },
                ]}
              />
              <Text style={styles.legendText}>
                Zone 2
              </Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: "#D94343" },
                ]}
              />
              <Text style={styles.legendText}>
                Main Road
              </Text>
            </View>
          </View>
        </View>

        {/* GPS STATUS */}
        <Text style={styles.sectionTitle}>
          GPS Location
        </Text>

        <View style={styles.gpsCard}>
          <View style={styles.gpsIcon}>
            <Ionicons
              name="location"
              size={24}
              color="#27AE60"
            />
          </View>

          <View style={styles.gpsContent}>
            <Text style={styles.gpsTitle}>
              Location Available
            </Text>

            <Text style={styles.gpsText}>
              GPS is ready for patrol tracking
            </Text>
          </View>

          <View style={styles.gpsBadge}>
            <View style={styles.gpsDot} />
            <Text style={styles.gpsBadgeText}>
              ONLINE
            </Text>
          </View>
        </View>

        {/* START / END PATROL */}
        <TouchableOpacity
          style={[
            styles.patrolButton,
            {
              backgroundColor: patrolStarted
                ? "#D94343"
                : "#5A51E8",
            },
          ]}
          onPress={togglePatrol}
        >
          <Ionicons
            name={
              patrolStarted
                ? "stop-circle-outline"
                : "play-circle-outline"
            }
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.patrolButtonText}>
            {patrolStarted
              ? "END PATROL"
              : "START PATROL"}
          </Text>
        </TouchableOpacity>

        {/* CHECK IN */}
        <Text style={styles.sectionTitle}>
          Patrol Check-In
        </Text>

        <TouchableOpacity
          style={[
            styles.checkInButton,
            checkedIn && styles.checkInCompleted,
          ]}
          onPress={handleCheckIn}
          disabled={checkedIn}
        >
          <Ionicons
            name={
              checkedIn
                ? "checkmark-circle"
                : "location-outline"
            }
            size={21}
            color={checkedIn ? "#27AE60" : "#5A51E8"}
          />

          <Text
            style={[
              styles.checkInText,
              checkedIn && styles.checkInCompletedText,
            ]}
          >
            {checkedIn
              ? "LOCATION CHECKED IN"
              : "CHECK IN LOCATION"}
          </Text>
        </TouchableOpacity>

        {/* PATROL HISTORY */}
        <Text style={styles.sectionTitle}>
          Patrol History
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
              Patrol Route B
            </Text>

            <Text style={styles.historyDetails}>
              Zone 2 → Main Road
            </Text>

            <Text style={styles.historyTime}>
              Yesterday • 6:10 PM - 9:45 PM
            </Text>
          </View>

          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>
              COMPLETED
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
              Patrol Route A
            </Text>

            <Text style={styles.historyDetails}>
              Zone 1 → Zone 2
            </Text>

            <Text style={styles.historyTime}>
              Sept. 22 • 6:00 PM - 10:00 PM
            </Text>
          </View>

          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>
              COMPLETED
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
    fontSize: 21,
    fontWeight: "800",
    color: "#35358D",
    marginTop: 2,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  scroll: {
    padding: 18,
    paddingBottom: 35,
  },

  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  statusIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  statusContent: {
    flex: 1,
    marginLeft: 12,
  },

  statusTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#35358D",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#35358D",
    marginTop: 22,
    marginBottom: 11,
  },

  assignmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 15,
    elevation: 2,
  },

  assignmentTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  routeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  assignmentContent: {
    flex: 1,
    marginLeft: 11,
  },

  assignmentTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333",
  },

  assignmentDescription: {
    fontSize: 10,
    color: "#999",
    marginTop: 3,
  },

  assignedBadge: {
    backgroundColor: "#E5F7EA",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
  },

  assignedText: {
    color: "#24944A",
    fontSize: 9,
    fontWeight: "800",
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  routeText: {
    color: "#666",
    fontSize: 11,
    marginLeft: 7,
  },

  mapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    elevation: 2,
  },

  mapBackground: {
    height: 215,
    backgroundColor: "#E8E9E3",
    position: "relative",
    overflow: "hidden",
  },

  mapRoad1: {
    position: "absolute",
    width: 450,
    height: 25,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "22deg" }],
    top: 65,
    left: -80,
  },

  mapRoad2: {
    position: "absolute",
    width: 450,
    height: 20,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "-30deg" }],
    top: 125,
    left: -100,
  },

  mapRoad3: {
    position: "absolute",
    width: 450,
    height: 18,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "70deg" }],
    top: 80,
    left: 50,
  },

  mapRoad4: {
    position: "absolute",
    width: 450,
    height: 14,
    backgroundColor: "#D9DAD5",
    transform: [{ rotate: "-10deg" }],
    top: 155,
    left: -50,
  },

  routeLine: {
    position: "absolute",
    width: 145,
    height: 4,
    backgroundColor: "#5A51E8",
    transform: [{ rotate: "20deg" }],
    top: 103,
    left: 105,
  },

  zoneOne: {
    position: "absolute",
    top: 65,
    left: 75,
  },

  zoneTwo: {
    position: "absolute",
    top: 122,
    left: 195,
  },

  mainRoad: {
    position: "absolute",
    top: 65,
    right: 60,
  },

  currentLocation: {
    position: "absolute",
    top: 95,
    left: 142,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(90,81,232,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  currentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#5A51E8",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  mapLabel: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  mapLabelText: {
    fontSize: 10,
    color: "#555",
    marginLeft: 5,
  },

  mapLegend: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-around",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },

  legendText: {
    fontSize: 9,
    color: "#777",
  },

  gpsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  gpsIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#E5F7EA",
    justifyContent: "center",
    alignItems: "center",
  },

  gpsContent: {
    flex: 1,
    marginLeft: 11,
  },

  gpsTitle: {
    color: "#333",
    fontSize: 13,
    fontWeight: "800",
  },

  gpsText: {
    color: "#999",
    fontSize: 10,
    marginTop: 3,
  },

  gpsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5F7EA",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
  },

  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#27AE60",
    marginRight: 5,
  },

  gpsBadgeText: {
    color: "#24944A",
    fontSize: 8,
    fontWeight: "800",
  },

  patrolButton: {
    height: 55,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 15,
  },

  patrolButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },

  checkInButton: {
    height: 52,
    borderWidth: 1.5,
    borderColor: "#5A51E8",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  checkInCompleted: {
    borderColor: "#27AE60",
    backgroundColor: "#E5F7EA",
  },

  checkInText: {
    color: "#5A51E8",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 8,
  },

  checkInCompletedText: {
    color: "#24944A",
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

  historyDetails: {
    color: "#777",
    fontSize: 10,
    marginTop: 3,
  },

  historyTime: {
    color: "#999",
    fontSize: 9,
    marginTop: 3,
  },

  completedBadge: {
    backgroundColor: "#E5F7EA",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },

  completedText: {
    color: "#24944A",
    fontSize: 8,
    fontWeight: "800",
  },
});