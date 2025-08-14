// components/WeeklyGrid.tsx
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isBefore,
  isAfter,
  startOfMonth,
  parseISO,
} from "date-fns";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { getHabitLogSummary, Habit } from "../../lib/api";
import { isApplicable } from "../utils/isApplicable";
import { usePaginatedHabits } from "../hooks/usePaginatedHabits";
import GridCell from "./GridCell";
import Toast from "react-native-toast-message";

type WeeklyGridProps = {
  habits: Habit[];
  month: Date;
  currentPage: number;
  cellSize: number;
  dayLabelWidth: number;
};

export default function WeeklyGrid({
  habits,
  month,
  currentPage,
  cellSize,
  dayLabelWidth,
}: WeeklyGridProps) {
  const [completedLogs, setCompletedLogs] = useState<
    Record<string, Set<number>>
  >({});
  const today = new Date();
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { habitsToDisplay } = usePaginatedHabits(habits, currentPage);

  const fetchHabitLogSummary = async () => {
    try {
      const monthStr = format(month, "yyyy-MM");
      const data = await getHabitLogSummary(monthStr);
      setCompletedLogs(data);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to load habit data",
        text2:
          err.response?.data?.error ||
          "Something went wrong. Please try again.",
      });
    }
  };

  useEffect(() => {
    if (!habits.length) return;
    fetchHabitLogSummary();
  }, [habits, month]);

  return (
    <View style={styles.container}>
      <ScrollView
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        <View style={styles.gridContent}>
          <View style={[styles.stickyLeftColumn, { width: dayLabelWidth }]}>
            {monthDays.map((day) => (
              <View
                key={day.toISOString()}
                style={[
                  styles.cell,
                  { width: dayLabelWidth, height: cellSize },
                ]}
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
                      const completed = completedLogs[iso]?.has(habit.id);

                      const inFuture = isAfter(day, today);
                      const startDate = parseISO(habit.start_date);
                      const beforeStart = isBefore(day, startDate);

                      const inPause =
                        habit.pauses?.some((p) => {
                          const s = parseISO(p.start_date);
                          const e = p.end_date ? parseISO(p.end_date) : null;
                          return day >= s && (!e || day <= e);
                        }) ?? false;

                      const scheduleApplicable = isApplicable(habit, day);

                      const paused =
                        !inFuture &&
                        (inPause || (!beforeStart && !scheduleApplicable));

                      const applicable =
                        !inFuture &&
                        !beforeStart &&
                        !inPause &&
                        scheduleApplicable;

                      let status:
                        | "complete"
                        | "missed"
                        | "unlogged"
                        | undefined;
                      if (applicable) {
                        if (completed) status = "complete";
                        else
                          status = isBefore(day, today) ? "missed" : "unlogged";
                      }

                      return (
                        <GridCell
                          key={`${habit.id}-${iso}`}
                          applicable={applicable}
                          status={status}
                          paused={paused}
                          size={cellSize}
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
    backgroundColor: "#fff",
    zIndex: 10,
  },
  row: { flexDirection: "row" },
  cell: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    margin: 2,
    borderColor: "grey",
  },
  headerCell: { backgroundColor: "#fff" },
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
