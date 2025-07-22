import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  startOfMonth,
} from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getAllHabitLogs, Habit } from "../../lib/api";

const SCREEN_WIDTH = Dimensions.get("window").width;
const HABITS_PER_PAGE = 5;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 40) / (HABITS_PER_PAGE + 1));
const DAY_LABEL_WIDTH = Math.floor(CELL_SIZE * 0.7); // Narrower than regular cells

type Props = {
  habits: Habit[];
  month: Date;
};

export default function WeeklyGrid({ habits, month }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [currentPage, setCurrentPage] = useState(0);
  const [page, setPage] = useState(0);
  const [completedLogs, setCompletedLogs] = useState<
    Record<string, Set<number>>
  >({});
  const [showNav, setShowNav] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  const today = new Date();
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const pageCount = Math.ceil(habits.length / HABITS_PER_PAGE);
  const startIdx = page * HABITS_PER_PAGE;
  const endIdx = startIdx + HABITS_PER_PAGE;
  const habitsToDisplay = habits.slice(startIdx, endIdx);

  const showLeft = page > 0;
  const showRight = page < pageCount - 1;

  useEffect(() => {
    const fetchLogs = async () => {
      if (habits.length === 0) return;

      const ids = habits.map((h) => h.id);
      const logs = await getAllHabitLogs(ids);
      setCompletedLogs(logs);
    };

    fetchLogs();
  }, [habits, month]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    setShowNav(offsetY < 10);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 30 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50 && currentPage < pageCount - 1) {
          // Swipe left
          setCurrentPage((prev) => prev + 1);
          Animated.spring(translateX, {
            toValue: -(currentPage + 1) * SCREEN_WIDTH,
            useNativeDriver: true,
          }).start();
        } else if (gestureState.dx > 50 && currentPage > 0) {
          // Swipe right
          setCurrentPage((prev) => prev - 1);
          Animated.spring(translateX, {
            toValue: -(currentPage - 1) * SCREEN_WIDTH,
            useNativeDriver: true,
          }).start();
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: -currentPage * SCREEN_WIDTH,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* NAVIGATION BUTTONS */}
      {showNav && (
        <View style={styles.navButtons}>
          {showLeft ? (
            <Pressable onPress={() => setPage(page - 1)}>
              <Text style={styles.navText}>← Back</Text>
            </Pressable>
          ) : (
            <View style={styles.navBtnPlaceholder} />
          )}
          {showRight ? (
            <Pressable onPress={() => setPage(page + 1)}>
              <Text style={styles.navText}>More habits →</Text>
            </Pressable>
          ) : (
            <View style={styles.navBtnPlaceholder} />
          )}
        </View>
      )}

      {/* STICKY HEADER ROW */}
      <View style={styles.headerRow}>
        {/* Day Label */}
        <View style={[styles.cell, styles.headerCell, styles.dayLabelCell]}>
          <Text style={styles.headerText}>Day</Text>
        </View>

        {/* Habit Name Cells */}
        <ScrollView horizontal scrollEnabled={false}>
          <View style={styles.row}>
            {habitsToDisplay.map((habit) => (
              <View key={habit.id} style={[styles.cell, styles.headerCell]}>
                <Text numberOfLines={2} style={styles.habitName}>
                  {habit.name}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* MAIN SCROLLABLE GRID */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          {/* Sticky Left Column */}
          <View style={styles.stickyLeftColumn}>
            {monthDays.map((day) => (
              <View
                key={day.toISOString()}
                style={[styles.cell, styles.dateCell, styles.dayLabelCell]}
              >
                <Text style={styles.dayLabelText}>{day.getDate()}</Text>
              </View>
            ))}
          </View>

          {/* Grid Content */}
          <ScrollView horizontal scrollEnabled={false}>
            <View>
              {monthDays.map((day) => {
                const iso = format(day, "yyyy-MM-dd");

                return (
                  <View key={iso} style={styles.row}>
                    {habitsToDisplay.map((habit) => {
                      const iso = format(day, "yyyy-MM-dd");
                      const isFuture = isAfter(day, today);
                      const started = new Date(habit.start_date) <= day;
                      const completed = completedLogs[iso]?.has(habit.id);

                      let bgColor = "#eee";
                      let symbol = "";

                      if (!started || isFuture) {
                        bgColor = "#e5e5e5"; // Grey: future or not yet started
                      } else if (completed) {
                        // bgColor = "#bddf9a";
                        bgColor = "#52c41a";
                        symbol = "✓";
                      } else {
                        bgColor = "#ff4d4f"; // Red: missed
                        symbol = "✗";
                      }

                      return (
                        <View
                          key={`${habit.id}-${iso}`}
                          style={[styles.cell, { backgroundColor: bgColor }]}
                        >
                          <Text style={styles.icon}>{symbol}</Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 10,
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navText: {
    fontSize: 20,
    fontWeight: "600",
  },
  navBtnPlaceholder: {
    width: 32,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  stickyLeftColumn: {
    width: DAY_LABEL_WIDTH,
    backgroundColor: "#fff",
    zIndex: 10,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    margin: 2,
    borderColor: "grey",
  },
  headerCell: {
    backgroundColor: "#fff",
  },
  dayLabelCell: {
    width: DAY_LABEL_WIDTH,
  },
  dateCell: {
    borderTopWidth: 0,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  habitName: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 1,
  },
  dayLabelText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  icon: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000",
  },
});
