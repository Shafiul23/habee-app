// frontend/lib/requestNotificationPermissions.ts
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

export async function requestNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== "granted") {
      Alert.alert(
        "Notifications Disabled",
        "You can enable reminders later in settings."
      );
    }
  }
}
