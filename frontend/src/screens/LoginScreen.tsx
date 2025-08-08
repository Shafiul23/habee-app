import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../contexts/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { isValidEmail } from "../utils/validation";
import { requestNotificationPermissions } from "../../lib/requestNotificationPermissions";
import { DEV_USER, DEV_PASSWORD } from "@env";
import * as AppleAuthentication from "expo-apple-authentication";
import { useGlobalStyles } from "../styles/theme";
import { useTheme } from "../contexts/ThemeContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">;

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();
  const globalStyles = useGlobalStyles();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleLogin = async () => {
    if (!isValidEmail(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Enter a valid email address.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      await login(res.data.access_token);
      await requestNotificationPermissions();

      Toast.show({
        type: "success",
        text1: "Welcome back!",
      });
    } catch (err: any) {
      const message = err.response?.data?.error || "Something went wrong";
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("No identity token returned");
      }

      setLoading(true);
      const res = await api.post("/auth/apple", {
        token: credential.identityToken,
      });
      await login(res.data.access_token);
      await requestNotificationPermissions();

      Toast.show({
        type: "success",
        text1: "Welcome!",
      });
    } catch (err: any) {
      if (err.code === "ERR_CANCELED") {
        return;
      }
      Toast.show({
        type: "error",
        text1: "Apple Sign-In Failed",
        text2: err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[globalStyles.screen, styles.container]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={[globalStyles.text, styles.title]}>Habee</Text>

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

        <PrimaryButton title="Log In" onPress={handleLogin} loading={loading} />

        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={8}
            style={styles.appleButton}
            onPress={handleAppleLogin}
          />
        )}

        {loading && (
          <Text style={[globalStyles.text, styles.wakeNotice]}>
            First load may take up to a minute if the server is waking up.
          </Text>
        )}

        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text style={[globalStyles.text, styles.link]}>Don’t have an account? Register</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={[globalStyles.text, styles.link]}>Forgot password?</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

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
    appleButton: {
      width: "100%",
      height: 44,
      marginVertical: 6,
    },
  });

export default LoginScreen;
