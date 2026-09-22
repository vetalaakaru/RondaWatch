import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Screen = "landing" | "roles";

export default function Index() {
  const [screen, setScreen] = useState<Screen>("landing");

  // =========================
  // LANDING PAGE
  // =========================
  if (screen === "landing") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.landingContainer}>
          <View style={styles.logoArea}>
            <View style={styles.logoBox}>
              <Ionicons
                name="location"
                size={48}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.landingTitle}>
              RondaWatch
            </Text>

            <Text style={styles.landingSubtitle}>
              Barangay safety and patrol, together
            </Text>

            <View style={styles.featureRow}>
              <View style={styles.featureCircle}>
                <Ionicons
                  name="location-outline"
                  size={25}
                  color="#202060"
                />
              </View>

              <View style={styles.featureCircle}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={25}
                  color="#202060"
                />
              </View>

              <View style={styles.featureCircle}>
                <Ionicons
                  name="star-outline"
                  size={25}
                  color="#202060"
                />
              </View>
            </View>

            <Text style={styles.featureText}>
              Report hazards, Track patrols, Stay updated
            </Text>
          </View>

          <View style={styles.landingButtons}>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => setScreen("roles")}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedText}>
                Get Started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.accountButton}
              onPress={() => setScreen("roles")}
              activeOpacity={0.8}
            >
              <Text style={styles.accountButtonText}>
                I already have an account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // =========================
  // ROLE SELECTION
  // =========================
  return (
    <SafeAreaView style={styles.safeAreaWhite}>
      <ScrollView
        contentContainerStyle={styles.rolesContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* BACK BUTTON */}
        <TouchableOpacity
          onPress={() => setScreen("landing")}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#222222"
          />
        </TouchableOpacity>

        {/* LOGO */}
        <View style={styles.rolesHeader}>
          <View style={styles.smallLogo}>
            <Ionicons
              name="location"
              size={34}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.rolesTitle}>
            RondaWatch
          </Text>

          <Text style={styles.rolesSubtitle}>
            Sa Bawat Ronda, Ligtas ang Kapitbahayan.
          </Text>
        </View>

        {/* IDENTITY HEADER */}
        <View style={styles.identityHeader}>
          <View>
            <Text style={styles.identityTitle}>
              PUMILI NG
            </Text>

            <Text style={styles.identityTitle}>
              PAGKAKAKILANLAN
            </Text>

            <Text style={styles.identityDescription}>
              Select Portal Account Role
            </Text>
          </View>

          <View style={styles.securityBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color="#666666"
            />

            <View>
              <Text style={styles.securityTop}>
                2-Factor
              </Text>

              <Text style={styles.securityBottom}>
                Authentication
              </Text>
            </View>
          </View>
        </View>

        {/* =========================
            RESIDENT PORTAL
           ========================= */}
        <TouchableOpacity
          style={styles.portalCard}
          activeOpacity={0.7}
          onPress={() => {
            router.push("/auth/resident-login");
          }}
        >
          <View style={styles.portalIconResident}>
            <Ionicons
              name="home"
              size={27}
              color="#4B63D8"
            />
          </View>

          <View style={styles.portalContent}>
            <View style={styles.portalTitleRow}>
              <Text style={styles.portalTitle}>
                Resident Portal
              </Text>

              <View style={styles.residentTag}>
                <Text style={styles.residentTagText}>
                  Resident
                </Text>
              </View>
            </View>

            <Text style={styles.portalDescription}>
              Real-time neighborhood incident reporting,
              safety updates, and direct patrol coordination.
            </Text>
          </View>

          <Ionicons
            name="arrow-forward"
            size={18}
            color="#555555"
          />
        </TouchableOpacity>

        {/* =========================
            TANOD & OFFICER DUTY
           ========================= */}
        <TouchableOpacity
          style={styles.portalCard}
          activeOpacity={0.7}
          onPress={() => {
            router.push("/auth/tanod-login");
          }}
        >
          <View style={styles.portalIconTanod}>
            <Ionicons
              name="shield-checkmark"
              size={27}
              color="#E7B72C"
            />
          </View>

          <View style={styles.portalContent}>
            <View style={styles.portalTitleRow}>
              <Text style={styles.portalTitle}>
                Tanod & Officer Duty
              </Text>

              <View style={styles.tanodTag}>
                <Text style={styles.tanodTagText}>
                  Dispatch
                </Text>
              </View>
            </View>

            <Text style={styles.portalDescription}>
              Real-time patrol tracking, incident alerts,
              status updates & direct resident communication.
            </Text>
          </View>

          <Ionicons
            name="arrow-forward"
            size={18}
            color="#555555"
          />
        </TouchableOpacity>

        {/* RESIDENT SIGN UP */}
        <View style={styles.signupPrompt}>
          <Text style={styles.signupPromptText}>
            Bagong Residente sa Barangay?
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push("/auth/resident-register")
            }
            activeOpacity={0.7}
          >
            <Text style={styles.signupLink}>
              {" "}Mag-Sign Up Dito
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // =========================
  // GENERAL
  // =========================

  safeArea: {
    flex: 1,
    backgroundColor: "#7774B3",
  },

  safeAreaWhite: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // =========================
  // LANDING PAGE
  // =========================

  landingContainer: {
    flex: 1,
    backgroundColor: "#7774B3",
    marginHorizontal: 7,
    marginVertical: 7,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 28,
  },

  logoArea: {
    alignItems: "center",
  },

  logoBox: {
    width: 61,
    height: 78,
    backgroundColor: "#5A51E8",
    borderWidth: 2,
    borderColor: "#009BFF",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 1,
  },

  landingTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 5,
  },

  landingSubtitle: {
    fontSize: 9,
    color: "#E5E4F6",
    marginTop: 19,
  },

  featureRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 16,
  },

  featureCircle: {
    width: 31,
    height: 31,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  featureText: {
    color: "#E4E3F5",
    fontSize: 7,
    marginTop: 8,
  },

  landingButtons: {
    width: "100%",
    gap: 17,
  },

  getStartedButton: {
    height: 29,
    backgroundColor: "#EEEEEE",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  getStartedText: {
    color: "#25256D",
    fontWeight: "700",
    fontSize: 10,
  },

  accountButton: {
    height: 29,
    backgroundColor: "#35358D",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#171750",
    alignItems: "center",
    justifyContent: "center",
  },

  accountButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 9,
  },

  // =========================
  // ROLE SELECTION
  // =========================

  rolesContainer: {
    paddingHorizontal: 18,
    paddingTop: 25,
    paddingBottom: 40,
  },

  rolesHeader: {
    alignItems: "center",
  },

  backButton: {
    position: "absolute",
    left: 18,
    top: 25,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  smallLogo: {
    width: 55,
    height: 62,
    backgroundColor: "#5A51E8",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  rolesTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#171717",
    marginTop: 6,
  },

  rolesSubtitle: {
    fontSize: 8,
    color: "#555555",
    marginTop: 5,
  },

  // =========================
  // IDENTITY HEADER
  // =========================

  identityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 42,
    marginBottom: 16,
  },

  identityTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: "#222222",
  },

  identityDescription: {
    fontSize: 7,
    color: "#777777",
    marginTop: 3,
  },

  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 5,
  },

  securityTop: {
    fontSize: 6,
    fontWeight: "700",
    color: "#555555",
  },

  securityBottom: {
    fontSize: 6,
    color: "#777777",
  },

  // =========================
  // PORTAL CARDS
  // =========================

  portalCard: {
    minHeight: 95,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 7,
    marginBottom: 12,
    padding: 11,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FAFAFA",
  },

  portalIconResident: {
    width: 38,
    height: 38,
    borderRadius: 5,
    backgroundColor: "#DCE7FF",
    alignItems: "center",
    justifyContent: "center",
  },

  portalIconTanod: {
    width: 38,
    height: 38,
    borderRadius: 5,
    backgroundColor: "#FFF1B9",
    alignItems: "center",
    justifyContent: "center",
  },

  portalContent: {
    flex: 1,
    marginLeft: 9,
  },

  portalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  portalTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#202020",
    flexShrink: 1,
  },

  residentTag: {
    backgroundColor: "#E0E8FF",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  residentTagText: {
    fontSize: 5,
    color: "#4B63D8",
    fontWeight: "700",
  },

  tanodTag: {
    backgroundColor: "#FFE780",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  tanodTagText: {
    fontSize: 5,
    color: "#866900",
    fontWeight: "700",
  },

  portalDescription: {
    fontSize: 7,
    lineHeight: 11,
    color: "#666666",
    marginTop: 6,
  },

  // =========================
  // SIGN UP
  // =========================

  signupPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 17,
  },

  signupPromptText: {
    fontSize: 7,
    color: "#222222",
    fontWeight: "600",
  },

  signupLink: {
    fontSize: 7,
    color: "#35358D",
    fontWeight: "800",
  },
});