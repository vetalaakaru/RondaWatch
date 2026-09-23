import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function TanodSettings() {
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);

  const handleChangePassword = () => {
    Alert.alert(
      "Change Password",
      "Password change screen will be available here."
    );
  };

  const handleProfile = () => {
    Alert.alert(
      "Tanod Profile",
      "Your Tanod profile information can be managed here."
    );
  };

  const handleVerification = () => {
    Alert.alert(
      "Verification Status",
      "Your Tanod account is currently verified."
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            router.back();
          },
        },
      ]
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
            Settings
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="settings"
            size={22}
            color="#5A51E8"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons
              name="person"
              size={31}
              color="#5A51E8"
            />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              Tanod User
            </Text>

            <Text style={styles.profileRole}>
              Barangay Tanod
            </Text>

            <View style={styles.verifiedRow}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color="#27AE60"
              />

              <Text style={styles.verifiedText}>
                Verified Tanod
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.profileArrow}
            onPress={handleProfile}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        {/* PREFERENCES */}
        <Text style={styles.sectionTitle}>
          Preferences
        </Text>

        <View style={styles.settingsCard}>
          {/* NOTIFICATIONS */}
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Ionicons
                name="notifications-outline"
                size={21}
                color="#5A51E8"
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Notifications
              </Text>

              <Text style={styles.settingDescription}>
                Receive SOS and patrol alerts
              </Text>
            </View>

            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{
                false: "#D8D8DD",
                true: "#B8B4F5",
              }}
              thumbColor={
                notifications
                  ? "#5A51E8"
                  : "#FFFFFF"
              }
            />
          </View>

          <View style={styles.divider} />

          {/* LOCATION */}
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Ionicons
                name="location-outline"
                size={21}
                color="#5A51E8"
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Location Services
              </Text>

              <Text style={styles.settingDescription}>
                Allow location during patrol
              </Text>
            </View>

            <Switch
              value={location}
              onValueChange={setLocation}
              trackColor={{
                false: "#D8D8DD",
                true: "#B8B4F5",
              }}
              thumbColor={
                location
                  ? "#5A51E8"
                  : "#FFFFFF"
              }
            />
          </View>
        </View>

        {/* ACCOUNT */}
        <Text style={styles.sectionTitle}>
          Account
        </Text>

        <View style={styles.settingsCard}>
          {/* PROFILE */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleProfile}
          >
            <View style={styles.settingIcon}>
              <Ionicons
                name="person-outline"
                size={21}
                color="#5A51E8"
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Tanod Profile
              </Text>

              <Text style={styles.settingDescription}>
                View and manage your profile
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#999"
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* PASSWORD */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleChangePassword}
          >
            <View style={styles.settingIcon}>
              <Ionicons
                name="lock-closed-outline"
                size={21}
                color="#5A51E8"
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Change Password
              </Text>

              <Text style={styles.settingDescription}>
                Update your account password
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#999"
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* VERIFICATION */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleVerification}
          >
            <View style={styles.settingIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color="#27AE60"
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Verification Status
              </Text>

              <Text style={styles.settingDescription}>
                Your account is verified
              </Text>
            </View>

            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>
                VERIFIED
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* DUTY INFORMATION */}
        <Text style={styles.sectionTitle}>
          Duty Information
        </Text>

        <View style={styles.dutyCard}>
          <View style={styles.dutyItem}>
            <View style={styles.dutyIcon}>
              <Ionicons
                name="time-outline"
                size={20}
                color="#5A51E8"
              />
            </View>

            <View>
              <Text style={styles.dutyLabel}>
                Current Shift
              </Text>

              <Text style={styles.dutyValue}>
                6:00 PM - 10:00 PM
              </Text>
            </View>
          </View>

          <View style={styles.dutyDivider} />

          <View style={styles.dutyItem}>
            <View style={styles.dutyIcon}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#5A51E8"
              />
            </View>

            <View>
              <Text style={styles.dutyLabel}>
                Duty Status
              </Text>

              <Text style={styles.dutyValue}>
                Active Duty
              </Text>
            </View>

            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />

              <Text style={styles.activeText}>
                ACTIVE
              </Text>
            </View>
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color="#D94343"
          />

          <Text style={styles.logoutText}>
            LOG OUT
          </Text>
        </TouchableOpacity>

        <Text style={styles.version}>
          RondaWatch • Tanod Portal
        </Text>
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
    paddingBottom: 40,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  profileAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  profileInfo: {
    flex: 1,
    marginLeft: 13,
  },

  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#35358D",
  },

  profileRole: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },

  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  verifiedText: {
    color: "#27AE60",
    fontSize: 9,
    fontWeight: "700",
    marginLeft: 4,
  },

  profileArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F5F5F8",
    justifyContent: "center",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#35358D",
    marginTop: 22,
    marginBottom: 11,
  },

  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingHorizontal: 14,
    elevation: 2,
  },

  settingRow: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
  },

  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  settingContent: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  settingTitle: {
    color: "#333",
    fontSize: 13,
    fontWeight: "800",
  },

  settingDescription: {
    color: "#999",
    fontSize: 10,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEF2",
    marginLeft: 53,
  },

  verifiedBadge: {
    backgroundColor: "#E5F7EA",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  verifiedBadgeText: {
    color: "#24944A",
    fontSize: 8,
    fontWeight: "800",
  },

  dutyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 14,
    elevation: 2,
  },

  dutyItem: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
  },

  dutyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  dutyLabel: {
    color: "#999",
    fontSize: 9,
  },

  dutyValue: {
    color: "#333",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
  },

  dutyDivider: {
    height: 1,
    backgroundColor: "#EEEEF2",
    marginVertical: 10,
    marginLeft: 53,
  },

  activeBadge: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5F7EA",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#27AE60",
    marginRight: 5,
  },

  activeText: {
    color: "#24944A",
    fontSize: 8,
    fontWeight: "800",
  },

  logoutButton: {
    height: 53,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5B5B5",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 25,
  },

  logoutText: {
    color: "#D94343",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },

  version: {
    textAlign: "center",
    color: "#AAAAAA",
    fontSize: 9,
    marginTop: 16,
  },
});