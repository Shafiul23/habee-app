import { addMonths, subMonths } from "date-fns";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getHabits, Habit } from "../../lib/api";
import HeaderNav from "../components/HeaderNav";
import WeeklyGrid from "../components/WeeklyGrid";
import { getLayoutConstants } from "../constants/layout";
import { usePaginatedHabits } from "../hooks/usePaginatedHabits";

export default function GridScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const { pageCount, habitsToDisplay } = usePaginatedHabits(
    habits,
    currentPage
  );
  const { cellSize, dayLabelWidth } = getLayoutConstants(
    habitsToDisplay.length
  );

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

  const handleLeft = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  const handleRight = () => {
    if (currentPage < pageCount - 1) setCurrentPage((p) => p + 1);
  };

  return (
    <>
      <HeaderNav
        date={selectedMonth}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
      />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View
            style={[styles.cell, styles.headerCell, { width: dayLabelWidth }]}
          >
            <Text style={styles.headerText}>Day</Text>
          </View>
          <View style={styles.row}>
            {habitsToDisplay.map((habit) => (
              <View
                key={habit.id}
                style={[
                  styles.cell,
                  styles.headerCell,
                  { width: cellSize, height: cellSize },
                ]}
              >
                <Text numberOfLines={2} style={styles.habitName}>
                  {habit.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {habits.length > 0 ? (
            <WeeklyGrid
              habits={habits}
              month={selectedMonth}
              currentPage={currentPage}
              cellSize={cellSize}
              dayLabelWidth={dayLabelWidth}
            />
          ) : (
            <Text style={styles.emptyText}>
              No habits to display. Add habits to view your monthly progress.
            </Text>
          )}
        </ScrollView>

        {currentPage < pageCount - 1 && (
          <Pressable style={styles.fabRight} onPress={handleRight}>
            <Text style={styles.navText}>→</Text>
          </Pressable>
        )}
        {currentPage > 0 && (
          <Pressable style={styles.fabLeft} onPress={handleLeft}>
            <Text style={styles.navText}>←</Text>
          </Pressable>
        )}
      </View>
    </>
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
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 8,
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
  dateCell: { borderTopWidth: 0 },
  headerText: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  habitName: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 1,
  },
  dayLabelText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  fabLeft: {
    position: "absolute",
    bottom: 30,
    left: 20,
    backgroundColor: "#f7ce46",
    padding: 16,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabRight: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#f7ce46",
    padding: 16,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  navText: {
    fontSize: 20,
    fontWeight: "600",
  },
});
