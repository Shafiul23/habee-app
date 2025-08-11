import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Constants from "expo-constants";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";
import { RootStackParamList } from "../../types";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../contexts/AuthContext";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">;

export default function SettingsScreen() {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const { logout, deleteAccount } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error logging out",
        text2: err.message || "Something went wrong while logging out.",
      });
    }
  };

  const handleSupport = async () => {
    const url = "https://habee-app.com";
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Toast.show({
        type: "error",
        text1: "Unable to open the support page.",
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
        <PrimaryButton title="Support Habee" onPress={handleSupport} />
        <PrimaryButton title="Log Out" onPress={handleLogout} />
        <View>
          <Pressable
            style={styles.aboutButton}
            onPress={() => setShowAbout((prev) => !prev)}
          >
            <Ionicons
              name={showAbout ? "chevron-down" : "chevron-forward"}
              size={20}
              color="#000"
              style={styles.aboutIconLeft}
            />

            <Text style={styles.aboutButtonText}>About</Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="transparent"
              style={styles.aboutIconRight}
            />
          </Pressable>

          {showAbout && (
            <View style={styles.aboutCard}>
              <Text style={styles.aboutBody}>
                {`Habee is built by a solo developer to replace clunky spreadsheet tracking with a clean, intuitive habit-tracking experience. Other apps often feel cluttered, overly complex, hidden behind paywalls, or filled with ads.

Habee focuses on simplicity, visual progress, and an ad-free experience. Supporting Habee helps cover ongoing running costs — from hosting and databases to keeping the app free of ads and unnecessary barriers.`}
              </Text>
            </View>
          )}
        </View>
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
          Version {Constants.expoConfig?.version || "1.0.0"}
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
  aboutButton: {
    backgroundColor: "#f7ce46",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aboutIconLeft: {
    width: 24,
    textAlign: "left",
  },
  aboutIconRight: {
    width: 24,
    textAlign: "right",
  },
  aboutButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
    flexShrink: 1,
  },
  aboutCard: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#f6f7f8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  aboutBody: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  deleteButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: 16,
  },
  versionText: {
    textAlign: "center",
    fontSize: 14,
    color: "#999",
    marginTop: 40,
    marginBottom: 20,
  },
});
