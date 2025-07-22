// frontend / screens / CalendarScreen.tsx;
import { addMonths, format, subMonths } from "date-fns";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { CalendarSummary, getCalendarSummary } from "../../lib/api";
import CalendarGrid from "../components/CalendarGrid";
import MonthHeader from "../components/MonthHeader";

export default function CalendarScreen() {
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

  return (
    <View style={styles.container}>
      <MonthHeader
        date={selectedMonth}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
      />
      <CalendarGrid month={selectedMonth} summary={calendarData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 100,
  },
});
