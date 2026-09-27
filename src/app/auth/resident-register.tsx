import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ResidentRegister() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = () => {
    if (
      !fullName ||
      !email ||
      !mobile ||
      !address ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Missing Information", "Please complete all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Error", "Passwords do not match.");
      return;
    }

    Alert.alert(
      "Registration Successful",
      "Your resident account has been created.",
      [
        {
          text: "Continue",
          onPress: () => router.replace("/auth/resident-login"),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#35358D" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoCircle}>
          <Ionicons name="person-add" size={38} color="#5A51E8" />
        </View>

        <Text style={styles.title}>Resident Registration</Text>

        <Text style={styles.subtitle}>
          Create your RondaWatch resident account
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#7774B3" />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <Text style={styles.label}>Email Address</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#7774B3" />
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

          <Text style={styles.label}>Mobile Number</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#7774B3" />
            <TextInput
              style={styles.input}
              placeholder="09XXXXXXXXX"
              placeholderTextColor="#999"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.label}>Address</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#7774B3" />
            <TextInput
              style={styles.input}
              placeholder="Enter your address"
              placeholderTextColor="#999"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <Text style={styles.label}>Password</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#7774B3" />

            <TextInput
              style={styles.input}
              placeholder="Create a password"
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

          <Text style={styles.label}>Confirm Password</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#7774B3" />

            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
            />

            <TouchableOpacity
              onPress={() => setShowConfirm(!showConfirm)}
            >
              <Ionicons
                name={showConfirm ? "eye-off-outline" : "eye-outline"}
                size={21}
                color="#7774B3"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={styles.registerText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() => router.replace("/auth/resident-login")}
            >
              <Text style={styles.loginLink}> Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  scroll: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    alignItems: "center",
  },
  logoCircle: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#35358D",
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
    textAlign: "center",
  },
  form: {
    width: "100%",
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#35358D",
    marginBottom: 7,
    marginTop: 12,
  },
  inputContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    backgroundColor: "#FAFAFA",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  registerButton: {
    height: 55,
    backgroundColor: "#5A51E8",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  registerText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },
  bottomText: {
    color: "#777",
  },
  loginLink: {
    color: "#5A51E8",
    fontWeight: "800",
  },
});