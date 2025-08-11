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
          1) create some habits that you'd like to do every day, e.g., take
          supplements, or walk 10k steps, or stretch
        </Text>
        <Text style={styles.text}>
          2) set a reminder on the notifications time to get a daily reminder to
          log habits, or edit a specific habit to get a custom reminder for that
          habit
        </Text>
        <Text style={styles.text}>
          3) when a habit is complete, tap it to mark it as done. This will
          provide a satisfying check mark for a nice dopamine release
        </Text>
        <Text style={styles.text}>
          4) over time, progress will be stored and visualised into different
          formats to see the progress you've made. The calendar screen will show
          if you've completed all, some, or none of your habits on each day in a
          month. The grid screen will show a more detailed break down, showing
          the track record of each habit throughout the month.
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

