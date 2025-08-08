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
import LoadingSpinner from "../components/LoadingSpinner";
import Toast from "react-native-toast-message";
import { useGlobalStyles } from "../styles/theme";
import { useTheme } from "../contexts/ThemeContext";

export default function GridScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedHabitId, setExpandedHabitId] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const globalStyles = useGlobalStyles();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const { pageCount, habitsToDisplay } = usePaginatedHabits(
    habits,
    currentPage
  );
  const { cellSize, dayLabelWidth } = getLayoutConstants(
    habitsToDisplay.length
  );

  const fetchHabits = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const data = await getHabits();
      setHabits(data);
      setError(false);
    } catch (err: any) {
      setError(true);
      Toast.show({
        type: "error",
        text1: "Error loading habits",
        text2: err.response?.data?.error || "Server unreachable.",
      });
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits(true);
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
    <View style={globalStyles.screen}>
      <HeaderNav
        date={selectedMonth}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
      />
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <View style={[styles.container, styles.centered]}>
          <Text style={[globalStyles.text, styles.emptyText]}>
            Failed to load your habits. Please try again.
          </Text>
          <Pressable
            onPress={() => fetchHabits(true)}
            style={styles.retryButton}
          >
            <Text style={[globalStyles.text, styles.retryButtonText]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <View
              style={[styles.cell, styles.headerCell, { width: dayLabelWidth }]}
            >
              <Text style={styles.headerText}>Day</Text>
            </View>
            <View style={styles.row}>
              {habitsToDisplay.map((habit) => (
                <Pressable
                  key={habit.id}
                  onPress={() =>
                    setExpandedHabitId((prev) =>
                      prev === habit.id ? null : habit.id
                    )
                  }
                >
                  <View
                    style={[
                      styles.cell,
                      styles.headerCell,
                      {
                        width: cellSize,
                        height:
                          expandedHabitId === habit.id
                            ? cellSize * 1.8
                            : cellSize,
                        backgroundColor:
                          expandedHabitId === habit.id ? "#f6f6f6" : "#fff",
                      },
                    ]}
                  >
                    <Text
                      numberOfLines={
                        expandedHabitId === habit.id ? undefined : 2
                      }
                      style={styles.habitName}
                    >
                      {habit.name}
                    </Text>
                  </View>
                </Pressable>
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
              <Text style={[globalStyles.text, styles.emptyText]}>
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
      )}
    </View>
  );
}

const getStyles = (colors: { background: string; text: string }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
    },
    emptyText: {
      fontSize: 16,
      color: colors.text,
      textAlign: "center",
      paddingHorizontal: 20,
      marginTop: 20,
      lineHeight: 24,
    },
    headerRow: {
      flexDirection: "row",
      backgroundColor: colors.background,
      marginHorizontal: 8,
      zIndex: 10,
    },
    gridContent: {
      flexDirection: "row",
      justifyContent: "center",
    },
    stickyLeftColumn: {
      backgroundColor: colors.background,
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
    headerCell: { backgroundColor: colors.background },
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
      color: colors.text,
    },
    dayLabelText: {
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
      color: colors.text,
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
    color: colors.text,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#f7ce46",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
});
