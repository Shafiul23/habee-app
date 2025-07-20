import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import { CalendarSummary } from "../../lib/api";

type Props = {
  month: Date;
  summary: CalendarSummary;
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarGrid({ month, summary }: Props) {
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
              <View
                key={iso}
                style={[styles.cell, { backgroundColor: bgColor }]}
              >
                <Text style={styles.dayText}>{day.getDate()}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const CELL_SIZE = 44;

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
    fontWeight: "600",
    width: CELL_SIZE,
    textAlign: "center",
    color: "#000",
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
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
