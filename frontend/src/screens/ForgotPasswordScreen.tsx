import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput
} from "react-native";
import Toast from "react-native-toast-message";
import api from "../../lib/api";
import { RootStackParamList } from "../../types";
import PrimaryButton from "../components/PrimaryButton";
import { isValidEmail } from "../utils/validation";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ForgotPassword"
>;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<NavigationProp>();

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid email format",
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });

      Toast.show({
        type: "success",
        text1: "Check your email for a reset link",
      });

      // Auto-navigate back after 3 seconds
      setTimeout(() => navigation.goBack(), 3000);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to send reset link",
        text2: err.response?.data?.error || "Try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </Pressable>

      <Text style={styles.heading}>Forgot Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <PrimaryButton
        title="Send Reset Link"
        onPress={handleSubmit}
        loading={loading}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f9f9f9",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 30,
    left: 20,
    zIndex: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#000",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
    color: "#000",
    fontSize: 16,
  },
});
