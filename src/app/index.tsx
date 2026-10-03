import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>

      <Text style={styles.logo}>🛡️</Text>

      <Text style={styles.title}>RondaWatch</Text>

      <Text style={styles.subtitle}>
        Barangay safety and patrol, together
      </Text>

      <Text style={styles.description}>
        Report hazards, track patrols, stay updated
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/register')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.loginText}>
          I already have an account
        </Text>
      </TouchableOpacity>

    </View>
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
type Screen =
  | "landing"
  | "roles"
  | "residentLogin"
  | "tanodLogin"
  | "signup";

export default function Index() {
  const [screen, setScreen] = useState<Screen>("landing");

  const goBack = () => {
    if (screen === "roles") {
      setScreen("landing");
    } else if (
      screen === "residentLogin" ||
      screen === "tanodLogin" ||
      screen === "signup"
    ) {
      setScreen("roles");
    }
  };

  if (screen === "landing") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.landingContainer}>
          <View style={styles.logoArea}>
            <View style={styles.logoBox}>
              <Ionicons name="location" size={48} color="#FFFFFF" />
              <View style={styles.shieldSide} />
            </View>

            <Text style={styles.landingTitle}>RondaWatch</Text>

            <Text style={styles.landingSubtitle}>
              Barangay safety and patrol, together
            </Text>

            <View style={styles.featureRow}>
              <View style={styles.featureCircle}>
                <Ionicons name="location-outline" size={25} color="#202060" />
              </View>

              <View style={styles.featureCircle}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={25}
                  color="#202060"
                />
              </View>

              <View style={styles.featureCircle}>
                <Ionicons name="star-outline" size={25} color="#202060" />
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
              <Text style={styles.getStartedText}>Get Started</Text>
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

  if (screen === "roles") {
    return (
      <SafeAreaView style={styles.safeAreaWhite}>
        <ScrollView
          contentContainerStyle={styles.rolesContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.rolesHeader}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="#222222" />
            </TouchableOpacity>

            <View style={styles.smallLogo}>
              <Ionicons name="location" size={34} color="#FFFFFF" />
            </View>

            <Text style={styles.rolesTitle}>RondaWatch</Text>

            <Text style={styles.rolesSubtitle}>
              Sa Bawat Ronda, Ligtas ang Kapitbahayan.
            </Text>
          </View>

          <View style={styles.identityHeader}>
            <View>
              <Text style={styles.identityTitle}>PUMILI NG</Text>
              <Text style={styles.identityTitle}>PAGKAKAKILANLAN</Text>
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
                <Text style={styles.securityTop}>2-Factor</Text>
                <Text style={styles.securityBottom}>Authentication</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.portalCard}
            onPress={() => setScreen("residentLogin")}
            activeOpacity={0.85}
          >
            <View style={styles.portalIconResident}>
              <Ionicons name="home" size={27} color="#4B63D8" />
            </View>

            <View style={styles.portalContent}>
              <View style={styles.portalTitleRow}>
                <Text style={styles.portalTitle}>Resident Portal</Text>
                <View style={styles.residentTag}>
                  <Text style={styles.residentTagText}>Resident</Text>
                </View>
              </View>

              <Text style={styles.portalDescription}>
                Real-time neighborhood incident reporting, safety
                updates, and direct patrol coordination.
              </Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#555555"
              style={styles.portalArrow}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.portalCard}
            onPress={() => setScreen("tanodLogin")}
            activeOpacity={0.85}
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
                  <Text style={styles.tanodTagText}>Dispatch</Text>
                </View>
              </View>

              <Text style={styles.portalDescription}>
                Real-time patrol tracking, incident alerts, status
                updates & direct resident communication.
              </Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#555555"
              style={styles.portalArrow}
            />
          </TouchableOpacity>

          <View style={styles.signupPrompt}>
            <Text style={styles.signupPromptText}>
              Bagong Residente sa Barangay?
            </Text>

            <TouchableOpacity onPress={() => setScreen("signup")}>
              <Text style={styles.signupLink}> Mag-Sign Up Dito</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "residentLogin") {
    return (
      <LoginScreen
        role="Resident"
        icon="home"
        onBack={goBack}
        onSignup={() => setScreen("signup")}
      />
    );
  }

  if (screen === "tanodLogin") {
    return (
      <LoginScreen
        role="Tanod & Officer"
        icon="shield-checkmark"
        onBack={goBack}
        onSignup={() => setScreen("roles")}
      />
    );
  }

  return <SignupScreen onBack={goBack} />;
}

function LoginScreen({
  role,
  icon,
  onBack,
  onSignup,
}: {
  role: string;
  icon: keyof typeof Ionicons.glyphMap;
  onBack: () => void;
  onSignup: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeAreaWhite}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={onBack} style={styles.formBackButton}>
            <Ionicons name="arrow-back" size={23} color="#222222" />
          </TouchableOpacity>

          <View style={styles.formLogo}>
            <Ionicons name="location" size={43} color="#FFFFFF" />
          </View>

          <Text style={styles.formTitle}>RondaWatch</Text>

          <Text style={styles.formSubtitle}>
            Sa Bawat Ronda, Ligtas ang Kapitbahayan.
          </Text>

          <View style={styles.roleIndicator}>
            <Ionicons name={icon} size={19} color="#4B45A9" />
            <Text style={styles.roleIndicatorText}>{role} Login</Text>
          </View>

          <Text style={styles.inputLabel}>Mobile Number / Barangay ID</Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#777777"
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your mobile number or ID"
              placeholderTextColor="#999999"
            />
          </View>

          <Text style={styles.inputLabel}>Password</Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#777777"
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999999"
              secureTextEntry
            />
            <Ionicons
              name="eye-outline"
              size={20}
              color="#777777"
            />
          </View>

          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>

          {role === "Resident" && (
            <View style={styles.bottomSignup}>
              <Text style={styles.bottomSignupText}>
                Don't have an account?
              </Text>

              <TouchableOpacity onPress={onSignup}>
                <Text style={styles.bottomSignupLink}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SignupScreen({ onBack }: { onBack: () => void }) {
  return (
    <SafeAreaView style={styles.safeAreaWhite}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={onBack} style={styles.formBackButton}>
            <Ionicons name="arrow-back" size={23} color="#222222" />
          </TouchableOpacity>

          <View style={styles.formLogo}>
            <Ionicons name="location" size={43} color="#FFFFFF" />
          </View>

          <Text style={styles.formTitle}>Create Account</Text>

          <Text style={styles.formSubtitle}>
            Join your barangay safety network.
          </Text>

          <View style={styles.signupNotice}>
            <Ionicons
              name="home-outline"
              size={22}
              color="#4B45A9"
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.signupNoticeTitle}>
                Resident Registration
              </Text>

              <Text style={styles.signupNoticeText}>
                Register your account to report hazards and receive
                barangay safety updates.
              </Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>Full Name</Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#777777"
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999999"
            />
          </View>

          <Text style={styles.inputLabel}>Mobile Number</Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="call-outline"
              size={20}
              color="#777777"
            />

            <TextInput
              style={styles.input}
              placeholder="09XX XXX XXXX"
              placeholderTextColor="#999999"
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.inputLabel}>Barangay ID</Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="card-outline"
              size={20}
              color="#777777"
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your Barangay ID"
              placeholderTextColor="#999999"
            />
          </View>

          <Text style={styles.inputLabel}>Password</Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#777777"
            />

            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#999999"
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7777B8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  logo: {
    fontSize: 65,
    marginBottom: 15,
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },

  description: {
    color: '#E8E8F5',
    fontSize: 13,
    marginBottom: 50,
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 14,
  },

  buttonText: {
    color: '#30305F',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loginButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
  },

  loginText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
  safeArea: {
    flex: 1,
    backgroundColor: "#7774B3",
  },

  safeAreaWhite: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

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
    position: "relative",
  },

  shieldSide: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 29,
    height: 48,
    backgroundColor: "rgba(40, 35, 150, 0.35)",
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
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    justifyContent: "center",
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

  portalArrow: {
    alignSelf: "flex-end",
    marginBottom: 2,
  },

  signupPrompt: {
    flexDirection: "row",
    justifyContent: "center",
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

  formContainer: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 28,
    paddingBottom: 40,
  },

  formBackButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
  },

  formLogo: {
    alignSelf: "center",
    width: 68,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#5A51E8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  formTitle: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "800",
    color: "#202020",
    marginTop: 9,
  },

  formSubtitle: {
    textAlign: "center",
    color: "#777777",
    fontSize: 10,
    marginTop: 5,
  },

  roleIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 28,
    marginBottom: 25,
  },

  roleIndicatorText: {
    color: "#4B45A9",
    fontWeight: "800",
    fontSize: 13,
  },

  inputLabel: {
    fontSize: 10,
    color: "#333333",
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 13,
  },

  inputWrapper: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    backgroundColor: "#FAFAFA",
  },

  input: {
    flex: 1,
    marginLeft: 9,
    fontSize: 12,
    color: "#222222",
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 10,
  },

  forgotText: {
    color: "#4B45A9",
    fontSize: 9,
    fontWeight: "700",
  },

  loginButton: {
    height: 48,
    backgroundColor: "#35358D",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },

  bottomSignup: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },

  bottomSignupText: {
    color: "#666666",
    fontSize: 10,
  },

  bottomSignupLink: {
    color: "#35358D",
    fontSize: 10,
    fontWeight: "800",
  },

  signupNotice: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#F0F0FF",
    borderRadius: 9,
    padding: 13,
    marginTop: 30,
    alignItems: "center",
  },

  signupNoticeTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#333333",
  },

  signupNoticeText: {
    fontSize: 8,
    color: "#666666",
    lineHeight: 12,
    marginTop: 3,
  },
});
