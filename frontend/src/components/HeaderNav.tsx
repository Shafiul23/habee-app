import { Ionicons } from "@expo/vector-icons";
import { format, isSameMonth, isSameYear, isToday } from "date-fns";
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
  mode?: "day" | "month";
  style?: StyleProp<ViewStyle>;
};

export default function HeaderNav({
  date,
  onPrev,
  onNext,
  mode = "month",
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const today = new Date();

  const formatted =
    mode === "day" ? format(date, "d MMMM yyyy") : format(date, "MMMM yyyy");

  const disableNext =
    mode === "day"
      ? isToday(date)
      : isSameMonth(date, today) && isSameYear(date, today);

  return (
    <View style={[{ backgroundColor: "#f7ce46" }, style]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={onPrev} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </Pressable>

        <Text style={styles.dateText}>{formatted}</Text>

        <Pressable onPress={onNext} disabled={disableNext} hitSlop={15}>
          <Ionicons
            name="chevron-forward"
            size={28}
            color={disableNext ? "#f7ce46" : "black"}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 5,
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
