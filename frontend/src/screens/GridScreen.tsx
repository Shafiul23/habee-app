// GridScreen.tsx
import { addMonths, subMonths } from "date-fns";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { getHabits, Habit } from "../../lib/api";
import MonthHeader from "../components/MonthHeader";
import WeeklyGrid from "../components/WeeklyGrid";

export default function GridScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    getHabits().then(setHabits).catch(console.error);
  }, []);

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
      <WeeklyGrid habits={habits} month={selectedMonth} />
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
