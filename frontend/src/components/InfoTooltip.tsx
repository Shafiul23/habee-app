import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import PrimaryButton from "./PrimaryButton";

interface InfoTooltipProps {
  onClose: () => void;
}

export default function InfoTooltip({ onClose }: InfoTooltipProps) {
  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.box} onPress={() => {}}>
        <Text style={styles.title}>How the app works</Text>

        <Text style={styles.text}>
          1) Create daily habits you want to track - for example: take
          supplements, walk 10k steps, or stretch.
        </Text>

        <Text style={styles.text}>
          2) Set reminders to help you stay consistent. You can choose a daily
          notification time or add custom reminders for individual habits.
        </Text>

        <Text style={styles.text}>
          3) When you complete a habit, tap it to mark it as done. Enjoy the
          satisfying check mark - and a little hit of dopamine.
        </Text>

        <Text style={styles.text}>
          4) Watch your progress build over time. The calendar view shows
          whether you’ve completed all, some, or none of your habits each day.
          The grid view breaks it down habit-by-habit across the month.
        </Text>

        <PrimaryButton title="Got it" onPress={onClose} />
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
    gap: 12,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
});
