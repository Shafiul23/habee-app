import { addMonths, format, subMonths } from "date-fns";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { CalendarSummary, getCalendarSummary } from "../../lib/api";
import CalendarGrid from "../components/CalendarGrid";
import HeaderNav from "../components/HeaderNav";
import Legend from "../components/Legend";

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
      <HeaderNav
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

        <Legend />
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
});
