import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function SettingsScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 80,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: "#f87171", // Tailwind red-400
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
