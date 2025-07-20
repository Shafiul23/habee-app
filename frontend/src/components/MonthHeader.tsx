// frontend/components/MonthHeader.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { isSameMonth, isSameYear, addMonths, format } from "date-fns";

type Props = {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
};

export default function MonthHeader({ date, onPrev, onNext }: Props) {
  const today = new Date();
  const isCurrentMonth = isSameMonth(date, today) && isSameYear(date, today);

  return (
    <View style={styles.header}>
      <Pressable onPress={onPrev} hitSlop={10}>
        <Ionicons name="chevron-back" size={28} color="#000" />
      </Pressable>

      <Text style={styles.dateText}>{format(date, "MMMM yyyy")}</Text>

      <Pressable onPress={onNext} disabled={isCurrentMonth} hitSlop={15}>
        <Ionicons
          name="chevron-forward"
          size={28}
          color={isCurrentMonth ? "#f7ce46" : "black"}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#f7ce46",
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 40,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
});
