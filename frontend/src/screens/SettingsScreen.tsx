import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Constants from "expo-constants";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "../../types";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../contexts/AuthContext";
import Toast from "react-native-toast-message";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">;

export default function SettingsScreen() {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const { logout, deleteAccount } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error loading habits",
        text2: err.message || "Something went wrong while logging out.",
      });
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
            setLoadingDelete(true);
            try {
              await deleteAccount();
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Error deleting account",
                text2: err.response?.data?.error || "Server unreachable.",
              });
              Alert.alert("Error", "Could not delete account.");
            } finally {
              setLoadingDelete(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      <View>
        <Text style={styles.title}>Settings</Text>
        <PrimaryButton
          title="Notifications"
          onPress={() => {
            navigation.navigate("NotificationSettings");
          }}
        />
        <PrimaryButton title="Support Habee" onPress={() => {}} />
        <PrimaryButton title="Log Out" onPress={handleLogout} />
        <PrimaryButton
          title="Delete Account"
          onPress={handleDeleteAccount}
          style={styles.deleteButton}
          textStyle={{ color: "red" }}
          disabled={loadingDelete}
          loading={loadingDelete}
        />
      </View>

      <View>
        <Text style={styles.versionText}>
          Version {Constants.manifest?.version || "1.0.0"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
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
  versionText: {
    // display: "flex",
    // justifyContent: "flex-end",
    textAlign: "center",
    fontSize: 14,
    color: "#999",
    marginTop: 40,
    marginBottom: 20,
  },
});
