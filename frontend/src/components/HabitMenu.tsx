// frontend/src/components/HabitMenu.tsx
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { getHabitReminderTime } from "../../lib/habitReminders";

type HabitMenuProps = {
  onClose: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onDelete: () => void;
  deleting: boolean;
  habitId?: number;
  onReminder?: () => void;
};

export default function HabitMenu({
  onClose,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  deleting,
  habitId,
  onReminder,
}: HabitMenuProps) {
  const [subtitle, setSubtitle] = useState<string>("Off");

  useEffect(() => {
    if (habitId === undefined) return;
    const load = async () => {
      const time = await getHabitReminderTime(habitId);
      if (time) {
        const h = time.hour.toString().padStart(2, "0");
        const m = time.minute.toString().padStart(2, "0");
        setSubtitle(`${h}:${m}`);
      } else {
        setSubtitle("Off");
      }
    };
    load();
  }, [habitId]);

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.menuBox}>
        {onEdit && <PrimaryButton title="Edit Habit" onPress={onEdit} />}
        {onArchive && (
          <PrimaryButton title="Archive Habit" onPress={onArchive} />
        )}
        {onUnarchive && (
          <PrimaryButton title="Unarchive Habit" onPress={onUnarchive} />
        )}
        {habitId !== undefined && onReminder && (
          <>
            <PrimaryButton title="Custom Reminder" onPress={onReminder} />
            <Text style={styles.reminderSubtitle}>{subtitle}</Text>
          </>
        )}
        <PrimaryButton
          title="Delete Habit"
          onPress={onDelete}
          loading={deleting}
          disabled={deleting}
          style={{
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#e0e0e0",
          }}
          textStyle={{ color: "red" }}
        />
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
  menuBox: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    width: 300,
    elevation: 5,
  },
  reminderSubtitle: {
    color: "#555",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 10,
  },
});
