import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import api from "../../lib/api";
import PrimaryButton from "../components/PrimaryButton";
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
        <Text style={styles.title}>Azm</Text>
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
        <PrimaryButton title="Log In" onPress={handleLogin} />
        <PrimaryButton title="Dev Login" onPress={handleDevLogin} />
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
});

export default LoginScreen;
