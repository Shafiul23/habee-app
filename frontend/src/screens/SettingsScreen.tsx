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
  View,
} from "react-native";
import { RootStackParamList } from "../../types";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useGlobalStyles } from "../styles/theme";
import Toast from "react-native-toast-message";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">;

export default function SettingsScreen() {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const { logout, deleteAccount } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const { theme, colors, toggleTheme } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = getStyles(colors);

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

  const handleToggleTheme = () => {
    Alert.alert("Toggle Theme", "", [
      { text: "Cancel", style: "cancel" },
      {
        text: theme === "light" ? "Enable dark mode" : "Enable light mode",
        onPress: toggleTheme,
      },
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={[globalStyles.screen, styles.container]}
    >
      <View>
        <Text style={[globalStyles.text, styles.title]}>Settings</Text>

        <PrimaryButton title="Toggle Theme" onPress={handleToggleTheme} />
        <PrimaryButton
          title="Notifications"
          onPress={() => {
            navigation.navigate("NotificationSettings");
          }}
        />
        <PrimaryButton title="Support Habee" onPress={handleSupport} />
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
        <Text style={[globalStyles.text, styles.versionText]}>Version {Constants.manifest?.version || "1.0.0"}</Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: { background: string; text: string }) =>
  StyleSheet.create({
    container: {
      flex: 1,
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
      marginBottom: 30,
    },
    deleteButton: {
      backgroundColor: colors.background,
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
