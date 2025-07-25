import React, { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Habit } from "../../lib/api";

type HabitItemProps = {
  item: Habit & { completed?: boolean };
  onToggle: () => void;
  onShowMenu: () => void;
};

export default function HabitItem({
  item,
  onToggle,
  onShowMenu,
}: HabitItemProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const isCompleted = item.completed ?? false;

  useEffect(() => {
    if (isCompleted) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [isCompleted]);

  return (
    <Pressable style={[styles.habit]} onPress={onToggle}>
      <View style={styles.habitRow}>
        <View style={styles.checkboxWrapper}>
          <View style={styles.checkboxBox} />
          <Animated.Text
            style={[
              styles.checkmark,
              {
                transform: [{ scale: scaleAnim }],
                opacity: scaleAnim,
              },
            ]}
          >
            ✓
          </Animated.Text>
        </View>
        <Text style={styles.habitText}>{item.name}</Text>
      </View>

      <Pressable onPress={onShowMenu}>
        <Ionicons name="ellipsis-vertical" size={20} color="#000" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  habit: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#f7ce46",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkboxWrapper: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#e6e6e6",
  },
  checkmark: {
    position: "absolute",
    fontSize: 26,
    fontWeight: "900",
    color: "black",
    bottom: -2,
    right: -2,
  },
  habitText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
    flexShrink: 1,
    flexGrow: 1,
    maxWidth: "85%",
  },
});
