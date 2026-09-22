import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResidentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter your email and password."
      );
      return;
    }

    router.replace("/resident/dashboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#35358D" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Ionicons
            name="shield-checkmark"
            size={42}
            color="#5A51E8"
          />
        </View>

        <Text style={styles.title}>Resident Login</Text>

        <Text style={styles.subtitle}>
          Welcome back to RondaWatch
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#7774B3"
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Password</Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#7774B3"
            />

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
                name={
                  showPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={21}
                color="#7774B3"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgot}>
            <Text style={styles.forgotText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginText}>LOGIN</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.line} />

            <Text style={styles.orText}>OR</Text>

            <View style={styles.line} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() =>
              router.push("/auth/resident-register")
            }
          >
            <Text style={styles.registerText}>
              CREATE ACCOUNT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tanodLink}
            onPress={() =>
              router.push("/auth/tanod-login")
            }
          >
            <Text style={styles.tanodText}>
              Tanod / Officer Login
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
    marginBottom: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#35358D",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#777",
  },

  form: {
    width: "100%",
    marginTop: 35,
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
    marginTop: 25,
  },

  loginText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD",
  },

  orText: {
    marginHorizontal: 12,
    color: "#999",
    fontWeight: "600",
  },

  registerButton: {
    height: 55,
    borderWidth: 1.5,
    borderColor: "#5A51E8",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  registerText: {
    color: "#5A51E8",
    fontWeight: "800",
    fontSize: 15,
  },

  tanodLink: {
    alignItems: "center",
    marginTop: 25,
  },

  tanodText: {
    color: "#35358D",
    fontWeight: "700",
  },
});