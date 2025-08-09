// frontend/src/components/HabitMenu.tsx
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import PrimaryButton from "./PrimaryButton";

type HabitMenuProps = {
  onClose: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onDelete: () => void;
  deleting: boolean;
};

export default function HabitMenu({
  onClose,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  deleting,
}: HabitMenuProps) {
  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.menuBox}>
        {onEdit && <PrimaryButton title="Edit Habit" onPress={onEdit} />}
        {onArchive && <PrimaryButton title="Archive Habit" onPress={onArchive} />}
        {onUnarchive && (
          <PrimaryButton title="Unarchive Habit" onPress={onUnarchive} />
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
});
