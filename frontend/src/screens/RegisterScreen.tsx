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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../contexts/AuthContext";
import { isValidEmail, isValidPassword } from "../utils/validation";
import Toast from "react-native-toast-message";
import { requestNotificationPermissions } from "../../lib/requestNotificationPermissions";
import { useGlobalStyles } from "../styles/theme";
import { useTheme } from "../contexts/ThemeContext";

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const { register } = useAuth();
  const globalStyles = useGlobalStyles();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleRegister = async () => {
    let valid = true;

    if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address");
      valid = false;
    }

    if (!isValidPassword(password)) {
      setPasswordError(
        "Password must be at least 6 characters, with 1 capital and 1 number"
      );
      valid = false;
    }

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      valid = false;
    }

    if (!valid) return;

    setLoading(true);
    try {
      await register(email, password);
      await requestNotificationPermissions();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Account created. You can now log in.",
      });
      navigation.navigate("Login");
    } catch (err: any) {
      const message = err.response?.data?.error || "Something went wrong";
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(null);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setConfirmError(null);
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={[globalStyles.text, styles.title]}>Register</Text>

          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={handleEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          {emailError && <Text style={styles.errorMessage}>{emailError}</Text>}

          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={handlePasswordChange}
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

          {passwordError && (
            <Text style={styles.errorMessage}>{passwordError}</Text>
          )}

          <View style={styles.requirementsList}>
            <Text style={[globalStyles.text, styles.requirementsItem]}>• At least 6 characters</Text>
            <Text style={[globalStyles.text, styles.requirementsItem]}>• 1 capital letter</Text>
            <Text style={[globalStyles.text, styles.requirementsItem]}>• 1 number</Text>
          </View>

          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
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

          {confirmError && (
            <Text style={styles.errorMessage}>{confirmError}</Text>
          )}

          <PrimaryButton
            title="Register"
            onPress={handleRegister}
            loading={loading}
          />

          {loading && (
            <Text style={[globalStyles.text, styles.wakeNotice]}>
              First load may take up to a minute if the server is waking up.
            </Text>
          )}

          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={[globalStyles.text, styles.link]}>Already have an account? Log in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const getStyles = (colors: { background: string; text: string }) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    card: {
      width: "100%",
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 24,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "600",
      marginBottom: 24,
      textAlign: "center",
    },
    input: {
      height: 50,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#dcdcdc",
      paddingHorizontal: 16,
      color: colors.text,
      marginBottom: 16,
      fontSize: 16,
    },
    inputError: {
      borderColor: "#c0392b",
    },
    passwordWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#dcdcdc",
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    passwordInput: {
      flex: 1,
      height: 50,
      color: colors.text,
      fontSize: 16,
    },
    requirementsList: {
      marginBottom: 16,
      paddingLeft: 8,
    },
    requirementsItem: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 18,
    },
    errorMessage: {
      color: "#c0392b",
      textAlign: "left",
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 10,
    },
    wakeNotice: {
      marginTop: 12,
      fontSize: 13,
      color: colors.text,
      textAlign: "center",
      lineHeight: 18,
    },
    link: {
      color: colors.text,
      textAlign: "center",
      marginTop: 16,
      fontWeight: "500",
    },
  });
