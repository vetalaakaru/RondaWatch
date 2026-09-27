import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function TanodRegister() {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [barangay, setBarangay] = useState("");
  const [tanodId, setTanodId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [idPhoto, setIdPhoto] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pickIdPhoto = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow photo library access to upload your Tanod ID."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setIdPhoto(result.assets[0].uri);
    }
  };

  const takeIdPhoto = async () => {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow camera access to take a picture of your Tanod ID."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setIdPhoto(result.assets[0].uri);
    }
  };

  const handleRegister = () => {
    if (
      !fullName ||
      !mobile ||
      !barangay ||
      !tanodId ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Missing Information",
        "Please complete all required fields."
      );
      return;
    }

    if (!idPhoto) {
      Alert.alert(
        "Tanod ID Required",
        "Please upload or take a picture of your Tanod ID."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Error",
        "Passwords do not match."
      );
      return;
    }

    Alert.alert(
      "Registration Submitted",
      "Your Tanod registration has been submitted for verification. A Barangay administrator must approve your account before you can access the Tanod Duty Portal.",
      [
        {
          text: "OK",
          onPress: () => router.replace("/auth/tanod-login"),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color="#35358D"
        />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoCircle}>
          <Ionicons
            name="shield-checkmark"
            size={38}
            color="#5A51E8"
          />
        </View>

        <Text style={styles.title}>
          Tanod Registration
        </Text>

        <Text style={styles.subtitle}>
          Register for Barangay Tanod verification
        </Text>

        <View style={styles.warningBox}>
          <Ionicons
            name="information-circle"
            size={24}
            color="#5A51E8"
          />

          <Text style={styles.warningText}>
            Your account will remain pending until a Barangay
            administrator verifies your Tanod ID.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <Text style={styles.label}>
            Full Name *
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#7774B3"
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <Text style={styles.label}>
            Mobile Number *
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="call-outline"
              size={20}
              color="#7774B3"
            />

            <TextInput
              style={styles.input}
              placeholder="09XXXXXXXXX"
              placeholderTextColor="#999"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.label}>
            Barangay *
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="location-outline"
              size={20}
              color="#7774B3"
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your Barangay"
              placeholderTextColor="#999"
              value={barangay}
              onChangeText={setBarangay}
            />
          </View>

          <Text style={styles.sectionTitle}>
            Tanod Verification
          </Text>

          <Text style={styles.label}>
            Tanod ID Number *
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="card-outline"
              size={20}
              color="#7774B3"
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your Tanod ID number"
              placeholderTextColor="#999"
              value={tanodId}
              onChangeText={setTanodId}
              autoCapitalize="characters"
            />
          </View>

          <Text style={styles.label}>
            Tanod ID Picture *
          </Text>

          <View style={styles.photoBox}>
            {idPhoto ? (
              <>
                <Image
                  source={{ uri: idPhoto }}
                  style={styles.idImage}
                />

                <TouchableOpacity
                  style={styles.changePhoto}
                  onPress={pickIdPhoto}
                >
                  <Ionicons
                    name="camera"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text style={styles.changePhotoText}>
                    Change Photo
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.cameraCircle}>
                  <Ionicons
                    name="card-outline"
                    size={35}
                    color="#5A51E8"
                  />
                </View>

                <Text style={styles.photoTitle}>
                  Upload your Tanod ID
                </Text>

                <Text style={styles.photoDescription}>
                  Take a photo or choose one from your gallery
                </Text>

                <View style={styles.photoButtons}>
                  <TouchableOpacity
                    style={styles.photoButton}
                    onPress={takeIdPhoto}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text style={styles.photoButtonText}>
                      Camera
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.galleryButton}
                    onPress={pickIdPhoto}
                  >
                    <Ionicons
                      name="images-outline"
                      size={20}
                      color="#5A51E8"
                    />

                    <Text style={styles.galleryButtonText}>
                      Gallery
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          <Text style={styles.sectionTitle}>
            Account Security
          </Text>

          <Text style={styles.label}>
            Password *
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#7774B3"
            />

            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity
              onPress={() =>
                setShowPassword(!showPassword)
              }
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

          <Text style={styles.label}>
            Confirm Password *
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#7774B3"
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
            />

            <TouchableOpacity
              onPress={() =>
                setShowConfirm(!showConfirm)
              }
            >
              <Ionicons
                name={
                  showConfirm
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={21}
                color="#7774B3"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color="#FFFFFF"
            />

            <Text style={styles.registerText}>
              SUBMIT FOR VERIFICATION
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>
              Already registered?
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.replace("/auth/tanod-login")
              }
            >
              <Text style={styles.loginLink}>
                {" "}Login
              </Text>
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
    paddingBottom: 45,
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
  warningBox: {
    width: "100%",
    backgroundColor: "#F5F4FF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    marginTop: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#555",
    marginLeft: 10,
  },
  form: {
    width: "100%",
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#35358D",
    marginTop: 20,
    marginBottom: 3,
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
  photoBox: {
    width: "100%",
    minHeight: 210,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#AAA",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    overflow: "hidden",
  },
  cameraCircle: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "#F0EFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  photoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#35358D",
    marginTop: 10,
  },
  photoDescription: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 5,
  },
  photoButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },
  photoButton: {
    height: 43,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#5A51E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  photoButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 6,
  },
  galleryButton: {
    height: 43,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#5A51E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryButtonText: {
    color: "#5A51E8",
    fontWeight: "700",
    marginLeft: 6,
  },
  idImage: {
    width: "100%",
    height: 210,
    resizeMode: "contain",
  },
  changePhoto: {
    position: "absolute",
    bottom: 10,
    backgroundColor: "#5A51E8",
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  changePhotoText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 6,
  },
  registerButton: {
    height: 55,
    backgroundColor: "#5A51E8",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 30,
  },
  registerText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 8,
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