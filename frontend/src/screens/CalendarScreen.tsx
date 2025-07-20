// frontend / screens / CalendarScreen.tsx;
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { format, addMonths, subMonths } from "date-fns";
import MonthHeader from "../components/MonthHeader";
import { CalendarSummary, getCalendarSummary } from "../../lib/api";
import CalendarGrid from "../components/CalendarGrid";

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
  },
  calendar: {
    marginTop: 10,
    borderRadius: 12,
    marginHorizontal: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
