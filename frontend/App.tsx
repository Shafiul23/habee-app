import React, { useEffect } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/components/ToastConfig";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Constants from "expo-constants";

export default function App() {
  useEffect(() => {
    if (Constants.appOwnership === "expo") {
      return;
    }

    void import("expo-notifications").then((Notifications) => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
        <Toast config={toastConfig} position="top" topOffset={50} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
