import { addMonths, format, subMonths } from "date-fns";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { CalendarSummary, getCalendarSummary } from "../../lib/api";
import CalendarGrid from "../components/CalendarGrid";
import HeaderNav from "../components/HeaderNav";
import Legend from "../components/Legend";
import LoadingSpinner from "../components/LoadingSpinner";
import Toast from "react-native-toast-message";

export default function CalendarScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarSummary>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const monthString = format(selectedMonth, "yyyy-MM");
      const data: CalendarSummary = await getCalendarSummary(monthString);
      setCalendarData(data);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error loading calendar",
        text2: err.response?.data?.error || "Server unreachable.",
      });
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(true);
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
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <CalendarGrid month={selectedMonth} summary={calendarData} />
            <Legend />
          </>
        )}
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
