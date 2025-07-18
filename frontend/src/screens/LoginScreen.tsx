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
import api from "../../lib/api";
import { useAuth } from "../contexts/AuthContext";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      await login(res.data.access_token);
    } catch (err: any) {
      Alert.alert(
        "Login Failed",
        err.response?.data?.error || "Something went wrong"
      );
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
        <Text style={styles.title}>Welcome Back 👋</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleDevLogin}>
          <Text style={styles.buttonText}>Dev Login</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    height: 50,
    backgroundColor: "#334155",
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#fff",
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#38bdf8",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});

export default LoginScreen;
