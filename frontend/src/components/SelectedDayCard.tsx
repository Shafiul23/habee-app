// components/SelectedDayCard.tsx
import { format } from "date-fns";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import ProgressDonut from "./ProgressDoughnut";

type DayEntry = {
  completed: number;
  total: number;
  status: "complete" | "partial" | "incomplete" | "inactive" | "future";
};

type Props = {
  date: Date;
  entry?: DayEntry;
  onHide?: () => void;
};

const STATUS_META: Record<
  NonNullable<Props["entry"]>["status"],
  { label: string; color: string }
> = {
  complete: { label: "Completed all", color: "#52c41a" },
  incomplete: { label: "Missed all", color: "#ff4d4f" },
  partial: { label: "Partial", color: "#f7ce46" },
  inactive: { label: "Inactive", color: "#e5e5e5" },
  future: { label: "Future", color: "#e5e5e5" },
};

export default function SelectedDayCard({ date, entry, onHide }: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [date?.toISOString()]);

  const status = entry?.status ?? "inactive";
  const meta = STATUS_META[status];

  const completed = entry?.completed ?? 0;
  const total = entry?.total ?? 0;

  return (
    <Animated.View style={[styles.card, { opacity: fade }]}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.weekday}>{format(date, "EEEE")}</Text>
          <Text style={styles.dateText}>{format(date, "d MMMM yyyy")}</Text>
        </View>

        <View
          style={[
            styles.badge,
            { backgroundColor: meta.color + "22", borderColor: meta.color },
          ]}
        >
          <View style={[styles.badgeDot, { backgroundColor: meta.color }]} />
          <Text style={styles.badgeText}>{meta.label}</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.leftCol}>
          <Text style={styles.metricLabel}>Habits completed: </Text>
          <Text style={styles.metricBig}>{`${completed} out of ${total}`}</Text>
          <Text style={styles.helperText}>
            Tap a day in the grid to update. Head over to the Grid screen to see
            which habits were on this day.
          </Text>
        </View>

        <ProgressDonut
          completed={completed}
          total={total}
          size={120}
          strokeWidth={12}
          color={meta.color}
          trackColor="#efefef"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 24,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  weekday: { fontSize: 16, fontWeight: "800" },
  dateText: { fontSize: 14, opacity: 0.7, marginTop: 2 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  contentRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  leftCol: { flex: 1 },
  metricLabel: { fontSize: 12, opacity: 0.7, marginBottom: 2 },
  metricBig: { fontSize: 20, fontWeight: "800", marginBottom: 6 },
  helperText: { fontSize: 12, opacity: 0.6 },
});
