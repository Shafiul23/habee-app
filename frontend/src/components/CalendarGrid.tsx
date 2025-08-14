import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
} from "date-fns";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CalendarSummary } from "../../lib/api";

type Props = {
  month: Date;
  summary: CalendarSummary;
  onDayPress?: (day: Date) => void;
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarGrid({ month, summary, onDayPress }: Props) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Week starts on Monday
  const startOffset = getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1;
  const endOffset = getDay(monthEnd) === 0 ? 6 : getDay(monthEnd) - 1;
  const trailingEmpty = 6 - endOffset;

  // Pad with nulls on both ends
  const paddedDays = [
    ...Array(startOffset).fill(null),
    ...allDays,
    ...Array(trailingEmpty).fill(null),
  ];

  // Chunk into weeks (rows of 7)
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      {/* Header Labels */}
      <View style={styles.weekRow}>
        {dayLabels.map((label) => (
          <Text key={label} style={styles.dayLabel}>
            {label}
          </Text>
        ))}
      </View>

      {/* Calendar Rows */}
      {weeks.map((week, i) => (
        <View key={`week-${i}`} style={styles.weekRow}>
          {week.map((day, j) => {
            if (!day) {
              return <View key={`empty-${j}`} style={styles.cell} />;
            }

            const iso = format(day, "yyyy-MM-dd");
            const status = summary[iso]?.status;

            const bgColor = {
              complete: "#52c41a",
              partial: "#f7ce46",
              incomplete: "#ff4d4f",
              inactive: "#e5e5e5",
              future: "#e5e5e5", // Same as inactive
            }[status ?? "inactive"];

            return (
              <TouchableOpacity
                key={iso}
                style={[styles.cell, { backgroundColor: bgColor }]}
                onPress={() => onDayPress?.(day)}
              >
                <Text style={styles.dayText}>{day.getDate()}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const CALENDAR_CELL_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: "700",
    width: CALENDAR_CELL_SIZE,
    textAlign: "center",
    color: "#000",
  },
  cell: {
    width: CALENDAR_CELL_SIZE,
    height: CALENDAR_CELL_SIZE,
    margin: 1,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontWeight: "700",
    color: "#000",
  },
});
