// frontend/src/screens/HomeScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { addDays, format, isToday, subDays } from "date-fns";
import React, { useCallback, useState, useEffect } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  Habit,
  deleteHabit,
  getHabitSummary,
  logHabit,
  undoHabit,
  archiveHabit,
} from "../../lib/api";
import { RootStackParamList } from "../../types";
import HabitItem from "../components/HabitItem";
import HabitMenu from "../components/HabitMenu";
import HeaderNav from "../components/HeaderNav";
import LoadingSpinner from "../components/LoadingSpinner";
import PrimaryButton from "../components/PrimaryButton";
import SwipeableDayView from "../components/SwipeableView";
import HabitReminderModal from "../components/HabitReminderModal";
import {
  cancelHabitReminder,
  removeHabitReminder,
} from "../../lib/habitReminders";
import AsyncStorage from "@react-native-async-storage/async-storage";
import InfoTooltip from "../components/InfoTooltip";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">;

export default function Home() {
  const [date, setDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showHabitMenu, setShowHabitMenu] = useState<number | null>(null);
  const [reminderHabit, setReminderHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const seen = await AsyncStorage.getItem("hasSeenInfoTooltip");
      if (!seen) {
        setShowInfo(true);
      }
    };
    checkFirstLaunch();
  }, []);

  const handleCloseInfo = async () => {
    setShowInfo(false);
    await AsyncStorage.setItem("hasSeenInfoTooltip", "true");
  };

  const loadHabits = async (isInitial = false, givenDate = date) => {
    if (isInitial) setLoading(true);
    try {
      const summary = await getHabitSummary(format(givenDate, "yyyy-MM-dd"));
      setHabits(summary);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHabits();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadHabits(true, date);
    }, [date])
  );

  const handleToggleHabit = async (id: number, completed = false) => {
    try {
      if (completed) {
        await undoHabit(id, format(date, "yyyy-MM-dd"));
      } else {
        await logHabit(id, format(date, "yyyy-MM-dd"));
      }

      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
      );
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error loading habits",
        text2: err.response?.data?.error || "Server unreachable.",
      });
    }
  };

  const goToPrevDay = () => {
    setDate((prev) => subDays(prev, 1));
  };
  const goToNextDay = () => {
    setDate((prev) => {
      if (!isToday(prev)) {
        return addDays(prev, 1);
      }
      return prev;
    });
  };

  const handleDeleteHabit = (habitId: number) => {
    Alert.alert(
      "Delete habit?",
      "Are you sure you want to delete this habit? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(habitId);
            try {
              await deleteHabit(habitId);
              await removeHabitReminder(habitId);
              setHabits((prev) => prev.filter((h) => h.id !== habitId));
              setShowHabitMenu(null);
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Error deleting habits",
                text2: err.response?.data?.error || "Server unreachable.",
              });
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleArchiveHabit = (habitId: number) => {
    Alert.alert(
      "Archive habit?",
      "It will be hidden from your Home screen for future dates. Past progress stays visible. You can unarchive it anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            try {
              await archiveHabit(habitId);
              await cancelHabitReminder(habitId);
              setShowHabitMenu(null);
              loadHabits(true);
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Error archiving habit",
                text2: err.response?.data?.error || "Server unreachable.",
              });
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <HeaderNav
        date={date}
        onPrev={goToPrevDay}
        onNext={goToNextDay}
        mode="day"
      />
      <SwipeableDayView onSwipeLeft={goToNextDay} onSwipeRight={goToPrevDay}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.innerContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.objectivesTitle}>
                {format(date, "EEEE")} Habits
              </Text>
              <View style={styles.iconRow}>
                <Pressable onPress={() => setShowInfo(true)} hitSlop={10}>
                  <Ionicons name="help-circle-outline" size={28} color="#000" />
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate("ArchivedHabits")}
                  hitSlop={10}
                >
                  <Ionicons name="archive-outline" size={24} color="#000" />
                </Pressable>
              </View>
            </View>

            {loading ? (
              <LoadingSpinner size="large" />
            ) : error ? (
              <View style={styles.emptyWrapper}>
                <Text style={styles.emptyText}>
                  Failed to load habits. Please try again.
                </Text>
                <PrimaryButton
                  title="Retry"
                  onPress={() => loadHabits(true)}
                  disabled={loading}
                />
              </View>
            ) : habits.length > 0 ? (
              habits.map((item) => (
                <HabitItem
                  key={item.id}
                  item={item}
                  onToggle={() => handleToggleHabit(item.id, item.completed)}
                  onShowMenu={() => setShowHabitMenu(item.id)}
                />
              ))
            ) : (
              <View style={styles.emptyWrapper}>
                <Text style={styles.emptyText}>
                  You haven’t added any habits yet.{"\n"}Tap the button below to
                  get started.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SwipeableDayView>

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("CreateHabit")}
      >
        <Ionicons name="create-outline" size={32} color="black" />
      </Pressable>

      {showHabitMenu !== null && (
        <HabitMenu
          onClose={() => setShowHabitMenu(null)}
          onEdit={() => {
            const habit = habits.find((h) => h.id === showHabitMenu);
            if (!habit) return;

            setShowHabitMenu(null);
            navigation.navigate("EditHabit", {
              habitId: habit.id,
              currentName: habit.name,
              frequency: habit.frequency,
              daysOfWeek: habit.days_of_week,
            });
          }}
          onDelete={() => handleDeleteHabit(showHabitMenu)}
          onArchive={() => handleArchiveHabit(showHabitMenu)}
          habitId={showHabitMenu}
          onReminder={() => {
            const habit = habits.find((h) => h.id === showHabitMenu);
            if (!habit) return;
            setShowHabitMenu(null);
            setReminderHabit(habit);
          }}
          deleting={deletingId === showHabitMenu}
        />
      )}
      {reminderHabit && (
        <HabitReminderModal
          habit={reminderHabit}
          onClose={() => setReminderHabit(null)}
        />
      )}
      {showInfo && <InfoTooltip onClose={handleCloseInfo} />}
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
    backgroundColor: "#fff",
  },
  innerContainer: {
    paddingHorizontal: 20,
    minHeight: "100%",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  objectivesTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  fab: {
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
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuBox: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    width: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#777",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});
