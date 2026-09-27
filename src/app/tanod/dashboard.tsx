import { Ionicons } from "@expo/vector-icons";
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

export default function TanodDashboard() {
  const [onDuty, setOnDuty] = useState(false);

  const toggleDuty = () => {
    setOnDuty(!onDuty);

    Alert.alert(
      !onDuty ? "Duty Started" : "Duty Ended",
      !onDuty
        ? "You are now marked as ON DUTY."
        : "You are now marked as OFF DUTY."
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.smallText}>
            Barangay Tanod Portal
          </Text>

          <Text style={styles.title}>
            Tanod Dashboard
          </Text>
        </View>

        <TouchableOpacity style={styles.profileButton}>
          <Ionicons
            name="person"
            size={22}
            color="#5A51E8"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.dutyCard}>
          <View style={styles.dutyHeader}>
            <View>
              <Text style={styles.dutyTitle}>
                Duty Status
              </Text>

              <View style={styles.dutyStatusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: onDuty
                        ? "#27AE60"
                        : "#999",
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.dutyStatus,
                    {
                      color: onDuty
                        ? "#27AE60"
                        : "#777",
                    },
                  ]}
                >
                  {onDuty ? "ON DUTY" : "OFF DUTY"}
                </Text>
              </View>
            </View>

            <Ionicons
              name="shield-checkmark"
              size={42}
              color="#5A51E8"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.dutyButton,
              {
                backgroundColor: onDuty
                  ? "#D94343"
                  : "#5A51E8",
              },
            ]}
            onPress={toggleDuty}
          >
            <Ionicons
              name={onDuty ? "log-out-outline" : "log-in-outline"}
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.dutyButtonText}>
              {onDuty ? "END DUTY" : "START DUTY"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          Today's Assignment
        </Text>

        <View style={styles.assignmentCard}>
          <View style={styles.assignmentIcon}>
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

            <Text style={styles.assignmentText}>
              Zone 1 → Zone 2 → Main Road
            </Text>

            <View style={styles.timeRow}>
              <Ionicons
                name="time-outline"
                size={15}
                color="#777"
              />

              <Text style={styles.timeText}>
                6:00 PM - 10:00 PM
              </Text>
            </View>
          </View>

          <View style={styles.assignedBadge}>
            <Text style={styles.assignedText}>
              ASSIGNED
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.quickCard}>
            <View style={styles.quickIcon}>
              <Ionicons
                name="map-outline"
                size={28}
                color="#5A51E8"
              />
            </View>

            <Text style={styles.quickTitle}>
              Patrol Map
            </Text>

            <Text style={styles.quickText}>
              View assigned patrol areas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard}>
            <View style={styles.quickIconOrange}>
              <Ionicons
                name="warning-outline"
                size={28}
                color="#E58D19"
              />
            </View>

            <Text style={styles.quickTitle}>
              Incidents
            </Text>

            <Text style={styles.quickText}>
              View active incidents
            </Text>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard}>
            <View style={styles.quickIconGreen}>
              <Ionicons
                name="checkmark-circle-outline"
                size={28}
                color="#27AE60"
              />
            </View>

            <Text style={styles.quickTitle}>
              Check In
            </Text>

            <Text style={styles.quickText}>
              Record patrol location
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard}>
            <View style={styles.quickIconPurple}>
              <Ionicons
                name="chatbubbles-outline"
                size={28}
                color="#8E5BEF"
              />
            </View>

            <Text style={styles.quickTitle}>
              Dispatch
            </Text>

            <Text style={styles.quickText}>
              Contact barangay team
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          Active Incidents
        </Text>

        <View style={styles.incidentCard}>
          <View style={styles.incidentIconRed}>
            <Ionicons
              name="warning"
              size={22}
              color="#D94343"
            />
          </View>

          <View style={styles.incidentContent}>
            <Text style={styles.incidentTitle}>
              Road Hazard
            </Text>

            <Text style={styles.incidentLocation}>
              Main Road • 10 mins ago
            </Text>

            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>
                HIGH PRIORITY
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.respondButton}>
            <Text style={styles.respondText}>
              RESPOND
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.incidentCard}>
          <View style={styles.incidentIconOrange}>
            <Ionicons
              name="alert-circle"
              size={22}
              color="#E58D19"
            />
          </View>

          <View style={styles.incidentContent}>
            <Text style={styles.incidentTitle}>
              Noise Complaint
            </Text>

            <Text style={styles.incidentLocation}>
              Zone 2 • 25 mins ago
            </Text>

            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>
                IN PROGRESS
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#AAA"
          />
        </View>

        <View style={styles.incidentCard}>
          <View style={styles.incidentIconBlue}>
            <Ionicons
              name="water-outline"
              size={22}
              color="#5A51E8"
            />
          </View>

          <View style={styles.incidentContent}>
            <Text style={styles.incidentTitle}>
              Flooding Report
            </Text>

            <Text style={styles.incidentLocation}>
              Zone 3 • 1 hour ago
            </Text>

            <View style={styles.ackBadge}>
              <Text style={styles.ackText}>
                ACKNOWLEDGED
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#AAA"
          />
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="home"
            size={23}
            color="#5A51E8"
          />
          <Text style={styles.activeNavText}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="map-outline"
            size={23}
            color="#999"
          />
          <Text style={styles.navText}>
            Patrol
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="warning-outline"
            size={23}
            color="#999"
          />
          <Text style={styles.navText}>
            Incidents
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="person-outline"
            size={23}
            color="#999"
          />
          <Text style={styles.navText}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  smallText: {
    fontSize: 12,
    color: "#888",
  },
  title: {
    fontSize: 21,
    fontWeight: "800",
    color: "#35358D",
    marginTop: 2,
  },
  profileButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    padding: 18,
    paddingBottom: 100,
  },
  dutyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    elevation: 2,
  },
  dutyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dutyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#35358D",
  },
  dutyStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  dutyStatus: {
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 7,
  },
  dutyButton: {
    height: 48,
    borderRadius: 12,
    marginTop: 18,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  dutyButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
    marginLeft: 8,
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
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  assignmentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  assignmentContent: {
    flex: 1,
    marginLeft: 12,
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333",
  },
  assignmentText: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  timeText: {
    fontSize: 10,
    color: "#777",
    marginLeft: 4,
  },
  assignedBadge: {
    backgroundColor: "#E9E7FF",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
  },
  assignedText: {
    fontSize: 8,
    color: "#5A51E8",
    fontWeight: "800",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickCard: {
    width: "47.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    position: "relative",
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  quickIconOrange: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
  },
  quickIconGreen: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E7F7ED",
    justifyContent: "center",
    alignItems: "center",
  },
  quickIconPurple: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1E9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  quickTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#35358D",
    marginTop: 10,
  },
  quickText: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
    lineHeight: 15,
  },
  countBadge: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: "#D94343",
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  incidentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  incidentIconRed: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  incidentIconOrange: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#FFF4E5",
    justifyContent: "center",
    alignItems: "center",
  },
  incidentIconBlue: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  incidentContent: {
    flex: 1,
    marginLeft: 11,
  },
  incidentTitle: {
    color: "#333",
    fontWeight: "800",
    fontSize: 13,
  },
  incidentLocation: {
    color: "#999",
    fontSize: 10,
    marginTop: 3,
  },
  priorityBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    marginTop: 5,
  },
  priorityText: {
    color: "#D94343",
    fontSize: 8,
    fontWeight: "800",
  },
  progressBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF2D9",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    marginTop: 5,
  },
  progressText: {
    color: "#C98A14",
    fontSize: 8,
    fontWeight: "800",
  },
  ackBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0EFFF",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    marginTop: 5,
  },
  ackText: {
    color: "#5A51E8",
    fontSize: 8,
    fontWeight: "800",
  },
  respondButton: {
    backgroundColor: "#5A51E8",
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 8,
  },
  respondText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeNavText: {
    color: "#5A51E8",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },
  navText: {
    color: "#999",
    fontSize: 10,
    marginTop: 3,
  },
});