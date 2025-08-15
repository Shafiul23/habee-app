// frontend/src/screens/NotificationSettingsScreen.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Switch,
  Text,
  View,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  cancelAllReminders,
  scheduleDailyReminder,
} from "../../lib/notifications";
import {
  cancelHabitReminder,
  getHabitReminderTime,
  removeHabitReminder,
  saveHabitReminder,
  ReminderTime,
} from "../../lib/habitReminders";
import { getHabits } from "../../lib/api";
import PrimaryButton from "../components/PrimaryButton";

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [pendingTime, setPendingTime] = useState<Date | null>(null);
  const [editing, setEditing] = useState(false);
  type CustomReminder = {
    habitId: number;
    habitName: string;
    time: ReminderTime;
    enabled: boolean;
    frequency: "DAILY" | "WEEKLY";
    daysOfWeek?: number[];
  };
  const [customReminders, setCustomReminders] = useState<CustomReminder[]>([]);
  const disabledReminders = useRef<Set<number>>(new Set());

  useEffect(() => {
    const loadSettings = async () => {
      const stored = await AsyncStorage.getItem("reminderTime");
      const isEnabled = await AsyncStorage.getItem("reminderEnabled");
      if (stored) setSelectedTime(new Date(stored));
      setReminderEnabled(isEnabled === "true");
    };
    loadSettings();
  }, []);

  const handleTimeChange = async (event: any, time?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "set" && time) {
        const hour = time.getHours();
        const minute = time.getMinutes();
        await scheduleDailyReminder(hour, minute);
        await AsyncStorage.setItem("reminderTime", time.toISOString());
        await AsyncStorage.setItem("reminderEnabled", "true");
        setSelectedTime(time);
        setEditing(false);
        Alert.alert(
          "Reminder Set",
          `You'll be reminded daily at ${hour}:${minute < 10 ? "0" : ""}${minute}`
        );
      } else {
        setEditing(false);
      }
    } else if (time) {
      setPendingTime(time);
    }
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

  useFocusEffect(
    useCallback(() => {
      const loadCustomReminders = async () => {
        const keys = await AsyncStorage.getAllKeys();
        const reminderKeys = keys.filter((k) =>
          k.startsWith("habitReminderTime:")
        );
        if (reminderKeys.length === 0) {
          setCustomReminders([]);
          return;
        }
        const habits = await getHabits();
        const habitMap = new Map(
          habits.map((h) => [h.id, { name: h.name, frequency: h.frequency, days: h.days_of_week }])
        );
        const items: CustomReminder[] = [];
        for (const key of reminderKeys) {
          const id = parseInt(key.split(":")[1], 10);
          const time = await getHabitReminderTime(id);
          const info = habitMap.get(id);
          if (time && info) {
            items.push({
              habitId: id,
              habitName: info.name,
              time,
              enabled: true,
              frequency: info.frequency,
              daysOfWeek: info.days,
            });
          }
        }
        setCustomReminders(items);
      };
      loadCustomReminders();

      return () => {
        const ids = Array.from(disabledReminders.current);
        disabledReminders.current.clear();
        ids.forEach((id) => {
          removeHabitReminder(id);
        });
      };
    }, [])
  );

  const formatReminderTime = (time: ReminderTime) => {
    const date = new Date();
    date.setHours(time.hour, time.minute, 0, 0);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleToggleCustomReminder = async (
    reminder: CustomReminder,
    val: boolean
  ) => {
    setCustomReminders((prev) =>
      prev.map((r) =>
        r.habitId === reminder.habitId ? { ...r, enabled: val } : r
      )
    );
    if (val) {
      await saveHabitReminder(
        reminder.habitId,
        reminder.habitName,
        reminder.time,
        reminder.frequency,
        reminder.daysOfWeek
      );
      disabledReminders.current.delete(reminder.habitId);
    } else {
      await cancelHabitReminder(reminder.habitId);
      disabledReminders.current.add(reminder.habitId);
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === "android" && (
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
      )}
      <View style={styles.row}>
        <Text style={styles.title}>Daily Reminder</Text>
        <Switch value={reminderEnabled} onValueChange={handleToggleReminder} />
      </View>

      {reminderEnabled && (
        <>
          {editing ? (
            <>
              <Text style={styles.label}>
                Pick a time for your daily reminder:
              </Text>
              <DateTimePicker
                value={pendingTime || selectedTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleTimeChange}
              />

              {Platform.OS === "ios" && pendingTime && (
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
              <Text style={styles.label}>
                Daily reminder time:{" "}
                <Text style={styles.timeText}>
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

      {customReminders.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Active Reminders</Text>
          {customReminders.map((r) => (
            <View key={r.habitId} style={styles.reminderRow}>
              <View style={styles.nameAndTime}>
                <Text style={styles.habitName}>{r.habitName}</Text>
                <Text style={styles.reminderTime}>
                  {formatReminderTime(r.time)}
                </Text>
              </View>
              <Switch
                value={r.enabled}
                onValueChange={(val) => handleToggleCustomReminder(r, val)}
              />
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 30,
    left: 20,
    zIndex: 10,
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
    color: "#000",
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  timeText: {
    fontWeight: "600",
    color: "#000",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginTop: 30,
    marginBottom: 20,
  },
  reminderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  nameAndTime: {
    maxWidth: "75%",
  },
  habitName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  reminderTime: {
    fontSize: 14,
    color: "#333",
  },
});
