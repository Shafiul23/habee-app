import { addMonths, subMonths } from "date-fns";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { getHabits, Habit } from "../../lib/api";
import HeaderNav from "../components/HeaderNav";
import WeeklyGrid from "../components/WeeklyGrid";

export default function GridScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHabits = async () => {
    try {
      const data = await getHabits();
      setHabits(data);
    } catch (err) {
      console.error("Failed to fetch habits:", err);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHabits();
    setRefreshing(false);
  };

  const handlePrevMonth = () => {
    setSelectedMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => addMonths(prev, 1));
  };

  return (
    <View style={styles.container}>
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
        {habits.length > 0 ? (
          <WeeklyGrid habits={habits} month={selectedMonth} />
        ) : (
          <Text style={styles.emptyText}>
            No habits to display. Add habits to view your monthly progress.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    lineHeight: 24,
  },
});
