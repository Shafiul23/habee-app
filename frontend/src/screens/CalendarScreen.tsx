import { addMonths, format, subMonths } from "date-fns";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { CalendarSummary, getCalendarSummary } from "../../lib/api";
import CalendarGrid from "../components/CalendarGrid";
import Legend from "../components/Legend";
import MonthHeader from "../components/MonthHeader";

export default function CalendarScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarSummary>({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      const monthString = format(selectedMonth, "yyyy-MM");
      const data: CalendarSummary = await getCalendarSummary(monthString);
      setCalendarData(data);
    } catch (err) {
      console.error("Failed to fetch calendar summary:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedMonth]);

  const handlePrevMonth = () => {
    setSelectedMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => addMonths(prev, 1));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
    setRefreshing(false);
  };

  return (
    <>
      <MonthHeader
        date={selectedMonth}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <CalendarGrid month={selectedMonth} summary={calendarData} />

        <View style={styles.legendRow}>
          <Legend color="#52c41a" label="Complete" />
          <Legend color="#f7ce46" label="Partial" />
          <Legend color="#ff4d4f" label="Missed" />
          <Legend color="#e5e5e5" label="Unlogged" />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 100,
    backgroundColor: "#fff",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    width: "100%",
  },
});
