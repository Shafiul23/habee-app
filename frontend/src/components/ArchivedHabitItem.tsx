import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ArchivedHabit } from "../../lib/api";

type Props = {
  item: ArchivedHabit;
  onShowMenu: () => void;
};

export default function ArchivedHabitItem({ item, onShowMenu }: Props) {
  return (
    <View style={styles.habit}>
      <Text style={styles.habitText}>{item.name}</Text>
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
  habitText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
    flexShrink: 1,
    flexGrow: 1,
    maxWidth: "85%",
  },
});
