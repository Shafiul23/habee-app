// components/WeeklyGrid.tsx
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  startOfMonth,
} from "date-fns";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { getAllHabitLogs, Habit } from "../../lib/api";
import { CELL_SIZE, DAY_LABEL_WIDTH } from "../constants/constants";
import { usePaginatedHabits } from "../hooks/usePaginatedHabits";
import GridCell from "./GridCell";

type WeeklyGridProps = {
  habits: Habit[];
  month: Date;
  currentPage: number;
};

export default function WeeklyGrid({
  habits,
  month,
  currentPage,
}: WeeklyGridProps) {
  const [completedLogs, setCompletedLogs] = useState<
    Record<string, Set<number>>
  >({});

  const today = new Date();
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { habitsToDisplay } = usePaginatedHabits(habits, currentPage);

  useEffect(() => {
    if (!habits.length) return;
    getAllHabitLogs(habits.map((h) => h.id))
      .then(setCompletedLogs)
      .catch(console.error);
  }, [habits, month]);

  return (
    <View style={styles.container}>
      <ScrollView
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.gridContent}>
          <View style={styles.stickyLeftColumn}>
            {monthDays.map((day) => (
              <View
                key={day.toISOString()}
                style={[styles.cell, styles.dateCell, styles.dayLabelCell]}
              >
                <Text style={styles.dayLabelText}>{day.getDate()}</Text>
              </View>
            ))}
          </View>
          <ScrollView horizontal scrollEnabled={false}>
            <View>
              {monthDays.map((day) => {
                const iso = format(day, "yyyy-MM-dd");
                return (
                  <View key={iso} style={styles.row}>
                    {habitsToDisplay.map((habit) => {
                      const isFuture = isAfter(day, today);
                      const started = new Date(habit.start_date) <= day;
                      const completed = completedLogs[iso]?.has(habit.id);
                      const inactive = isFuture || !started;

                      return (
                        <GridCell
                          key={`${habit.id}-${iso}`}
                          completed={!!completed}
                          inactive={inactive}
                        />
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 10,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  gridContent: {
    flexDirection: "row",
    justifyContent: "center",
  },
  stickyLeftColumn: {
    width: DAY_LABEL_WIDTH,
    backgroundColor: "#fff",
    zIndex: 10,
  },
  row: { flexDirection: "row" },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    margin: 2,
    borderColor: "grey",
  },
  headerCell: { backgroundColor: "#fff" },
  dayLabelCell: { width: DAY_LABEL_WIDTH },
  dateCell: { borderTopWidth: 0 },
  headerText: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  habitName: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 1,
  },
  dayLabelText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
