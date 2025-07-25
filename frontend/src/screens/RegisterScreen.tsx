import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      Alert.alert("Success", "Account created. You can now log in.");
      navigation.navigate("Login");
    } catch (err: any) {
      Alert.alert(
        "Registration Failed",
        err.response?.data?.error || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Register</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />

        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <Pressable onPress={() => setShowPassword((prev) => !prev)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#666"
            />
          </Pressable>
        </View>

        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
            editable={!loading}
          />
          <Pressable onPress={() => setShowConfirm((prev) => !prev)}>
            <Ionicons
              name={showConfirm ? "eye-off" : "eye"}
              size={24}
              color="#666"
            />
          </Pressable>
        </View>

        <PrimaryButton
          title="Register"
          onPress={handleRegister}
          loading={loading}
        />

        {loading && (
          <Text style={styles.wakeNotice}>
            First load may take up to a minute if the server is waking up.
          </Text>
        )}

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Already have an account? Log in</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    color: "#000",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    height: 50,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    paddingHorizontal: 16,
    color: "#000",
    marginBottom: 16,
    fontSize: 16,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    color: "#000",
    fontSize: 16,
  },
  wakeNotice: {
    marginTop: 12,
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  link: {
    color: "#000",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "500",
  },
});
