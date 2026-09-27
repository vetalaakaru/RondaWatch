import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function TanodLogin() {
  const [tanodId, setTanodId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!tanodId || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter your Tanod ID and password."
      );
      return;
    }

    router.replace("/tanod/dashboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#35358D" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Ionicons name="shield" size={42} color="#5A51E8" />
        </View>

        <Text style={styles.title}>Tanod Login</Text>

        <Text style={styles.subtitle}>
          Barangay Tanod & Officer Portal
        </Text>

        <View style={styles.verifiedBadge}>
          <Ionicons
            name="shield-checkmark"
            size={17}
            color="#5A51E8"
          />
          <Text style={styles.verifiedText}>
            Verified Tanod Access
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Tanod ID Number</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="card-outline" size={20} color="#7774B3" />

            <TextInput
              style={styles.input}
              placeholder="Enter Tanod ID number"
              placeholderTextColor="#999"
              value={tanodId}
              onChangeText={setTanodId}
              autoCapitalize="characters"
            />
          </View>

          <Text style={styles.label}>Password</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#7774B3" />

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={21}
                color="#7774B3"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgot}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Ionicons
              name="log-in-outline"
              size={21}
              color="#FFFFFF"
            />
            <Text style={styles.loginText}>LOGIN TO DUTY PORTAL</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#5A51E8"
            />

            <Text style={styles.infoText}>
              Your Tanod account must be verified by a Barangay
              administrator before you can access the duty portal.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push("/auth/tanod-register")}
          >
            <Text style={styles.registerText}>
              REGISTER AS TANOD
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.residentLink}
            onPress={() => router.push("/auth/resident-login")}
          >
            <Text style={styles.residentText}>
              Resident Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    marginTop: 10,
    marginLeft: 20,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  logoCircle: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 17,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#35358D",
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 6,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EFFF",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
  },
  verifiedText: {
    color: "#5A51E8",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 6,
  },
  form: {
    width: "100%",
    marginTop: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#35358D",
    marginBottom: 8,
    marginTop: 14,
  },
  inputContainer: {
    height: 55,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "#FAFAFA",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
  },
  forgot: {
    alignItems: "flex-end",
    marginTop: 10,
  },
  forgotText: {
    color: "#5A51E8",
    fontWeight: "600",
    fontSize: 13,
  },
  loginButton: {
    height: 55,
    backgroundColor: "#5A51E8",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 24,
  },
  loginText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: "#F5F4FF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    color: "#555",
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 10,
  },
  registerButton: {
    height: 52,
    borderWidth: 1.5,
    borderColor: "#5A51E8",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#5A51E8",
    fontWeight: "800",
    fontSize: 14,
  },
  residentLink: {
    alignItems: "center",
    marginTop: 20,
  },
  residentText: {
    color: "#35358D",
    fontWeight: "700",
  },
});