// frontend/src/screens/NotificationSettingsScreen.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import {
  cancelAllReminders,
  scheduleDailyReminder,
} from "../../lib/notifications";
import PrimaryButton from "../components/PrimaryButton";
import { useGlobalStyles } from "../styles/theme";
import { useTheme } from "../contexts/ThemeContext";

export default function NotificationSettingsScreen() {
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [pendingTime, setPendingTime] = useState<Date | null>(null);
  const [editing, setEditing] = useState(false);
  const globalStyles = useGlobalStyles();
  const { theme, colors } = useTheme();
  const styles = getStyles();

  useEffect(() => {
    const loadSettings = async () => {
      const stored = await AsyncStorage.getItem("reminderTime");
      const isEnabled = await AsyncStorage.getItem("reminderEnabled");
      if (stored) setSelectedTime(new Date(stored));
      setReminderEnabled(isEnabled === "true");
    };
    loadSettings();
  }, []);

  const handleTimeChange = async (_: any, time?: Date) => {
    if (time) setPendingTime(time);
  };

  const handleToggleReminder = async (val: boolean) => {
    setReminderEnabled(val);
    if (val) {
      const hour = selectedTime.getHours();
      const minute = selectedTime.getMinutes();
      await scheduleDailyReminder(hour, minute);
      await AsyncStorage.setItem("reminderTime", selectedTime.toISOString());
      await AsyncStorage.setItem("reminderEnabled", "true");
      setEditing(false);
      setPendingTime(null);
    } else {
      await cancelAllReminders();
      await AsyncStorage.setItem("reminderEnabled", "false");
    }
  };

  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Enable Notifications",
          "Notifications are disabled in your system settings. Open settings to enable?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    };
    checkPermissions();
  }, []);

  return (
    <View style={[globalStyles.screen, styles.container]}>
      <View style={styles.row}>
        <Text style={[globalStyles.text, styles.title]}>Daily Reminder</Text>
        <Switch value={reminderEnabled} onValueChange={handleToggleReminder} />
      </View>

      {reminderEnabled && (
        <>
          {editing ? (
            <>
              <Text style={[globalStyles.text, styles.label]}>
                Pick a time for your daily reminder:
              </Text>
              <DateTimePicker
                value={pendingTime || selectedTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleTimeChange}
                themeVariant={theme}
                textColor={colors.text}
              />

              {pendingTime && (
                <PrimaryButton
                  title="Confirm Reminder Time"
                  onPress={async () => {
                    const time = pendingTime;
                    const hour = time.getHours();
                    const minute = time.getMinutes();

                    await scheduleDailyReminder(hour, minute);
                    await AsyncStorage.setItem(
                      "reminderTime",
                      time.toISOString()
                    );
                    await AsyncStorage.setItem("reminderEnabled", "true");

                    setSelectedTime(time);
                    setPendingTime(null);
                    setEditing(false);

                    Alert.alert(
                      "Reminder Set",
                      `You'll be reminded daily at ${hour}:${
                        minute < 10 ? "0" : ""
                      }${minute}`
                    );
                  }}
                  style={{ marginTop: 10 }}
                />
              )}
            </>
          ) : (
            <>
              <Text style={[globalStyles.text, styles.label]}>
                Daily reminder time:{" "}
                <Text style={[globalStyles.text, styles.timeText]}>
                  {selectedTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Text>
              <PrimaryButton
                title="Edit Time"
                onPress={() => setEditing(true)}
                style={{ marginTop: 10 }}
              />
            </>
          )}
        </>
      )}
    </View>
  );
}

const getStyles = () =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingTop: 40,
      paddingBottom: 40,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
    },
    label: {
      fontSize: 16,
      marginBottom: 10,
    },
    timeText: {
      fontWeight: "600",
    },
  });
