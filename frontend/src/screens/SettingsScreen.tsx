import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../contexts/AuthContext";

export default function SettingsScreen() {
  const { logout, deleteAccount } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account?",
      "This will permanently delete your account and all associated data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (error) {
              console.error("Account deletion failed:", error);
              Alert.alert("Error", "Could not delete account.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <PrimaryButton title="Log Out" onPress={handleLogout} />
      <PrimaryButton
        title="Delete Account"
        onPress={handleDeleteAccount}
        style={styles.deleteButton}
        textStyle={{ color: "red" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 80,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#000",
    marginBottom: 30,
  },
  deleteButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: 16,
  },
});
