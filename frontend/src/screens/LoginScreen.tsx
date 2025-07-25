import React, { useState } from "react";
import {
  Alert,
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">;

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      await login(res.data.access_token);
    } catch (err: any) {
      Alert.alert(
        "Login Failed",
        err.response?.data?.error || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // DEV LOGIN - for testing purposes
  const handleDevLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email: "shaf@example.com",
        password: "secret123",
      });
      await login(res.data.access_token);
    } catch (err: any) {
      Alert.alert(
        "Login Failed",
        err.response?.data?.error || "Something went wrong"
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Azm</Text>

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
        <PrimaryButton
          title="Dev Login"
          onPress={handleDevLogin}
          loading={loading}
        />

        {loading && (
          <Text style={styles.wakeNotice}>
            First load may take up to a minute if the server is waking up.
          </Text>
        )}

        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>Don’t have an account? Register</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

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

export default LoginScreen;
