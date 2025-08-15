import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import PrimaryButton from "./PrimaryButton";
import {
  getHabitReminderTime,
  getHabitReminderCount,
  saveHabitReminder,
  removeHabitReminder,
  ReminderTime,
  MAX_REMINDERS,
} from "../../lib/habitReminders";
import { Habit } from "../../lib/api";

type Props = {
  habit: Habit;
  onClose: () => void;
};

export default function HabitReminderModal({ habit, onClose }: Props) {
  const [time, setTime] = useState<Date>(new Date());
  const [hasReminder, setHasReminder] = useState(false);

  useEffect(() => {
    const load = async () => {
      const stored = await getHabitReminderTime(habit.id);
      if (stored) {
        const d = new Date();
        d.setHours(stored.hour);
        d.setMinutes(stored.minute);
        d.setSeconds(0);
        setTime(d);
        setHasReminder(true);
      }
    };
    load();
  }, [habit.id]);

  const handleSave = async (t?: Date) => {
    const saveTime = t || time;
    if (!hasReminder) {
      const count = await getHabitReminderCount();
      if (count >= MAX_REMINDERS) {
        Toast.show({
          type: "info",
          text1: `You can set up to ${MAX_REMINDERS} reminders.`,
        });
        onClose();
        return;
      }
    }
    const reminder: ReminderTime = {
      hour: saveTime.getHours(),
      minute: saveTime.getMinutes(),
    };
    const granted = await saveHabitReminder(
      habit.id,
      habit.name,
      reminder,
      habit.frequency,
      habit.days_of_week
    );
    if (!granted) {
      Toast.show({
        type: "info",
        text1:
          "Notifications are disabled. Enable in Settings to receive reminders.",
      });
    }
    setHasReminder(true);
    onClose();
  };

  const handleRemove = async () => {
    await removeHabitReminder(habit.id);
    onClose();
  };

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.box} onPress={() => {}}>
        <Text style={styles.title}>Custom Reminder</Text>
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display={"spinner"}
          onChange={async (_, selected) => {
            if (selected) {
              setTime(selected);
              if (Platform.OS === "android") {
                await handleSave(selected);
              }
            }
          }}
        />
        {Platform.OS === "ios" && (
          <PrimaryButton title="Save" onPress={() => handleSave()} />
        )}
        {hasReminder && (
          <PrimaryButton
            title="Remove"
            onPress={handleRemove}
            style={styles.removeButton}
            textStyle={{ color: "red" }}
          />
        )}
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    width: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  removeButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
});
