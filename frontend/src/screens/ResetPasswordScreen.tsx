import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import Toast from "react-native-toast-message";
import api from "../../lib/api";
import { RootStackParamList } from "../../types";
import PrimaryButton from "../components/PrimaryButton";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ResetPassword"
>;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { token } = route.params;

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);

  // 🔍 Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        await api.get(`/auth/validate-reset-token/${token}`);
        setValidToken(true);
      } catch (err) {
        setValidToken(false);
        Toast.show({
          type: "error",
          text1: "Invalid or expired token",
        });
        setTimeout(() => navigation.goBack(), 2500);
      }
    };

    validateToken();
  }, [token]);

  const handleReset = async () => {
    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password too short",
        text2: "Use at least 6 characters",
      });
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });

      Toast.show({
        type: "success",
        text1: "Password reset successful",
      });

      setTimeout(() => navigation.navigate("Login"), 1000);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Reset failed",
        text2: err.response?.data?.error || "Try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={"padding"}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </Pressable>

      <Text style={styles.heading}>Reset Your Password</Text>

      {validToken === null ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          Validating token...
        </Text>
      ) : validToken ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter a new password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <PrimaryButton
            title="Reset Password"
            onPress={handleReset}
            loading={loading}
          />
        </>
      ) : (
        <Text style={{ textAlign: "center", color: "red", marginTop: 20 }}>
          Invalid or expired token
        </Text>
      )}
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
    top: 60,
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
