// frontend/src/screens/HomeScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { addDays, format, isToday, subDays } from "date-fns";
import React, { useCallback, useState } from "react";
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
} from "../../lib/api";
import { RootStackParamList } from "../../types";
import HabitItem from "../components/HabitItem";
import HabitMenu from "../components/HabitMenu";
import HeaderNav from "../components/HeaderNav";
import LoadingSpinner from "../components/LoadingSpinner";
import PrimaryButton from "../components/PrimaryButton";
import SwipeableDayView from "../components/SwipeableView";
import { useGlobalStyles } from "../styles/theme";
import { useTheme } from "../contexts/ThemeContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">;

export default function Home() {
  const [date, setDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showHabitMenu, setShowHabitMenu] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState(false);

  const navigation = useNavigation<NavigationProp>();
  const globalStyles = useGlobalStyles();
  const { colors } = useTheme();
  const styles = getStyles(colors);

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

  return (
    <View style={globalStyles.screen}>
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
            <Text style={[globalStyles.text, styles.objectivesTitle]}>
              {format(date, "EEEE")} Habits
            </Text>

            {loading ? (
              <LoadingSpinner size="large" />
            ) : error ? (
              <View style={styles.emptyWrapper}>
                <Text style={[globalStyles.text, styles.emptyText]}>
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
                <Text style={[globalStyles.text, styles.emptyText]}>
                  You haven’t added any habits yet.{"\n"}Tap the + button below
                  to get started.
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
        <Ionicons name="create-outline" size={32} color={colors.text} />
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
            });
          }}
          onDelete={() => handleDeleteHabit(showHabitMenu)}
          deleting={deletingId === showHabitMenu}
        />
      )}
    </View>
  );
}

const getStyles = (colors: { background: string; text: string }) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 100,
      backgroundColor: colors.background,
    },
    innerContainer: {
      paddingHorizontal: 20,
      minHeight: "100%",
    },
    objectivesTitle: {
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 16,
      marginTop: 20,
      color: colors.text,
      textAlign: "center",
      backgroundColor: colors.background,
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
    backgroundColor: colors.background,
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
