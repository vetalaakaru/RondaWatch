import { Ionicons } from "@expo/vector-icons";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ResidentDashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.smallText}>Welcome back</Text>
          <Text style={styles.title}>Resident Dashboard</Text>
        </View>

        <TouchableOpacity style={styles.notification}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color="#35358D"
          />

          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons
              name="shield-checkmark"
              size={27}
              color="#5A51E8"
            />
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              Barangay Safety Status
            </Text>

            <Text style={styles.statusText}>
              Your barangay is currently being monitored.
            </Text>
          </View>

          <View style={styles.safeBadge}>
            <Text style={styles.safeText}>SAFE</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Live Safety Map
        </Text>

        <View style={styles.mapContainer}>
          <View style={styles.mapBackground}>
            <View style={styles.mapRoad1} />
            <View style={styles.mapRoad2} />
            <View style={styles.mapRoad3} />
            <View style={styles.mapRoad4} />

            <View style={styles.mapPin1}>
              <Ionicons
                name="location"
                size={30}
                color="#E64B4B"
              />
            </View>

            <View style={styles.mapPin2}>
              <Ionicons
                name="location"
                size={27}
                color="#5A51E8"
              />
            </View>

            <View style={styles.mapPin3}>
              <Ionicons
                name="location"
                size={27}
                color="#F0A62B"
              />
            </View>

            <View style={styles.youLocation}>
              <View style={styles.youDot} />
            </View>

            <View style={styles.mapLabel}>
              <Ionicons
                name="navigate"
                size={16}
                color="#5A51E8"
              />
              <Text style={styles.mapLabelText}>
                Your Location
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.mapButton}>
            <Ionicons
              name="map-outline"
              size={18}
              color="#35358D"
            />

            <Text style={styles.mapButtonText}>
              View Full Map
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          Report & Emergency
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons
                name="warning-outline"
                size={27}
                color="#E64B4B"
              />
            </View>

            <Text style={styles.actionTitle}>
              Report Incident
            </Text>

            <Text style={styles.actionDescription}>
              Report a hazard or incident
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIconBlue}>
              <Ionicons
                name="navigate-outline"
                size={27}
                color="#5A51E8"
              />
            </View>

            <Text style={styles.actionTitle}>
              Safety Updates
            </Text>

            <Text style={styles.actionDescription}>
              View nearby reports
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.sosButton}>
          <View style={styles.sosIcon}>
            <Ionicons
              name="alert"
              size={25}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.sosContent}>
            <Text style={styles.sosTitle}>
              Emergency SOS
            </Text>

            <Text style={styles.sosText}>
              Send an emergency alert to the barangay
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={23}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>
          Recent Safety Reports
        </Text>

        <View style={styles.incidentCard}>
          <View style={styles.incidentIcon}>
            <Ionicons
              name="warning"
              size={21}
              color="#E64B4B"
            />
          </View>

          <View style={styles.incidentContent}>
            <Text style={styles.incidentTitle}>
              Road Hazard
            </Text>

            <Text style={styles.incidentLocation}>
              Main Road • 10 minutes ago
            </Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                Acknowledged
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
          <View style={styles.incidentIconYellow}>
            <Ionicons
              name="alert-circle"
              size={21}
              color="#F0A62B"
            />
          </View>

          <View style={styles.incidentContent}>
            <Text style={styles.incidentTitle}>
              Street Light Problem
            </Text>

            <Text style={styles.incidentLocation}>
              Zone 2 • 1 hour ago
            </Text>

            <View style={styles.statusBadgeYellow}>
              <Text style={styles.statusBadgeYellowText}>
                Reported
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
          <Text style={styles.activeNavText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="map-outline"
            size={23}
            color="#999"
          />
          <Text style={styles.navText}>Map</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="document-text-outline"
            size={23}
            color="#999"
          />
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="person-outline"
            size={23}
            color="#999"
          />
          <Text style={styles.navText}>Profile</Text>
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
  notification: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationDot: {
    position: "absolute",
    right: 9,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E64B4B",
  },
  scroll: {
    padding: 18,
    paddingBottom: 100,
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
  statusText: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },
  safeBadge: {
    backgroundColor: "#E5F7EA",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  safeText: {
    color: "#24944A",
    fontSize: 10,
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#35358D",
    marginTop: 22,
    marginBottom: 11,
  },
  mapContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    elevation: 2,
  },
  mapBackground: {
    height: 210,
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
  mapPin1: {
    position: "absolute",
    top: 55,
    left: 75,
  },
  mapPin2: {
    position: "absolute",
    top: 125,
    left: 220,
  },
  mapPin3: {
    position: "absolute",
    top: 45,
    right: 70,
  },
  youLocation: {
    position: "absolute",
    top: 98,
    left: 145,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(90,81,232,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  youDot: {
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
  mapButton: {
    height: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  mapButtonText: {
    color: "#35358D",
    fontWeight: "700",
    marginLeft: 7,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  actionIconBlue: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  actionTitle: {
    color: "#35358D",
    fontWeight: "800",
    fontSize: 13,
    marginTop: 10,
  },
  actionDescription: {
    color: "#888",
    fontSize: 10,
    marginTop: 4,
    lineHeight: 15,
  },
  sosButton: {
    backgroundColor: "#D94343",
    borderRadius: 16,
    padding: 14,
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
  },
  sosIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  sosContent: {
    flex: 1,
    marginLeft: 12,
  },
  sosTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  sosText: {
    color: "#FFECEC",
    fontSize: 10,
    marginTop: 3,
  },
  incidentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  incidentIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  incidentIconYellow: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#FFF7E6",
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
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0EFFF",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 5,
  },
  statusBadgeText: {
    color: "#5A51E8",
    fontSize: 9,
    fontWeight: "700",
  },
  statusBadgeYellow: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF4D9",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 5,
  },
  statusBadgeYellowText: {
    color: "#C98A14",
    fontSize: 9,
    fontWeight: "700",
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