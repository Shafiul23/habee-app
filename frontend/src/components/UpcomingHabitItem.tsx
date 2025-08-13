import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Habit } from "../../lib/api";

type Props = {
  item: Habit;
  onShowMenu: () => void;
};

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function UpcomingHabitItem({ item, onShowMenu }: Props) {
  const days = item.days_of_week?.slice().sort((a, b) => a - b);
  const subtitle = days?.map((d) => dayLabels[d]).join(", ");

  return (
    <View style={styles.habit}>
      <View style={styles.textCol}>
        <Text style={styles.habitText}>{item.name}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Pressable onPress={onShowMenu}>
        <Ionicons name="ellipsis-vertical" size={20} color="#000" />
      </Pressable>
    </View>
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
  textCol: {
    flexShrink: 1,
    flexGrow: 1,
    maxWidth: "85%",
  },
  habitText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#333",
    marginTop: 2,
  },
});
