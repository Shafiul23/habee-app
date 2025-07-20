// frontend / screens / CalendarScreen.tsx;
import { addMonths, format, subMonths } from "date-fns";
import React, { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { CalendarSummary, getCalendarSummary } from "../../lib/api";
import CalendarGrid from "../components/CalendarGrid";
import MonthHeader from "../components/MonthHeader";

export default function CalendarScreen() {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarSummary>({});

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const monthString = format(selectedMonth, "yyyy-MM");
        const data: CalendarSummary = await getCalendarSummary(monthString);
        setCalendarData(data);
      } catch (err) {
        console.error("Failed to fetch calendar summary:", err);
      }
    };

    fetchSummary();
  }, [selectedMonth]);

  const handlePrevMonth = () => {
    setSelectedMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => addMonths(prev, 1));
  };

  const [underlineAnim] = useState(new Animated.Value(0)); // 0 for left, 1 for right

  const switchView = (mode: "month" | "week") => {
    setViewMode(mode);
    Animated.timing(underlineAnim, {
      toValue: mode === "month" ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <MonthHeader
        date={selectedMonth}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
      />

      <View style={styles.toggleWrapper}>
        <View style={styles.toggleContainer}>
          <Pressable
            style={[styles.tabButton, viewMode === "month" && styles.underline]}
            onPress={() => switchView("month")}
          >
            <Text
              style={[styles.tabText, viewMode === "month" && styles.tabActive]}
            >
              Month View
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabButton, viewMode === "week" && styles.underline]}
            onPress={() => switchView("week")}
          >
            <Text
              style={[styles.tabText, viewMode === "week" && styles.tabActive]}
            >
              Week View
            </Text>
          </Pressable>
        </View>
      </View>

      {viewMode === "month" ? (
        <CalendarGrid month={selectedMonth} summary={calendarData} />
      ) : (
        <Text>Habit Grid coming soon...</Text> // placeholder for now
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  toggleWrapper: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
    position: "relative",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
  },
  tabButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
    color: "#888",
  },
  tabActive: {
    fontWeight: "bold",
    color: "#000",
  },
  underline: {
    borderBottomWidth: 2,
  },
});
