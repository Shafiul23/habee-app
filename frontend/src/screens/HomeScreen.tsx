// frontend/src/screens/HomeScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { addDays, format, isToday, subDays } from "date-fns";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Habit,
  deleteHabit,
  getHabitSummary,
  logHabit,
  undoHabit,
} from "../../lib/api";
import { RootStackParamList } from "../../types";
import HabitItem from "../components/HabitItem";
import HeaderNav from "../components/HeaderNav";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../contexts/AuthContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">;

export default function Home() {
  const [date, setDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showHabitMenu, setShowHabitMenu] = useState<number | null>(null);

  const { isLoggedIn } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const loadHabits = async () => {
    try {
      const summary = await getHabitSummary(format(date, "yyyy-MM-dd"));
      setHabits(summary);
    } catch (err) {
      console.error("Failed to load habits:", err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHabits();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadHabits();
    }, [isLoggedIn, date])
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
    } catch (err) {
      console.error("Failed to toggle habit:", err);
    }
  };

  const goToPrevDay = () => setDate(subDays(date, 1));
  const goToNextDay = () => {
    if (!isToday(date)) setDate(addDays(date, 1));
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
            try {
              await deleteHabit(habitId);
              setHabits((prev) => prev.filter((h) => h.id !== habitId));
              setShowHabitMenu(null);
            } catch (err) {
              console.error("Failed to delete habit:", err);
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.innerContainer}>
          <Text style={styles.objectivesTitle}>
            {format(date, "EEEE")} Habits
          </Text>
          {habits.length > 0 ? (
            habits.map((item) => (
              <HabitItem
                key={item.id}
                item={item}
                onToggle={() => handleToggleHabit(item.id, item.completed)}
                onShowMenu={() => setShowHabitMenu(item.id)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              You haven’t added any habits yet. Tap the button below to get
              started.
            </Text>
          )}
        </View>
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("CreateHabit")}
      >
        <Ionicons name="create-outline" size={32} color="black" />
      </Pressable>

      {showHabitMenu !== null && (
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowHabitMenu(null)}
        >
          <Pressable onPress={() => {}} style={styles.menuBox}>
            <PrimaryButton
              title="Edit Habit"
              onPress={() => {
                Alert.alert("Edit feature not implemented yet.");
                setShowHabitMenu(null);
              }}
            />
            <PrimaryButton
              title="Delete Habit"
              onPress={() => handleDeleteHabit(showHabitMenu)}
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#e0e0e0",
              }}
              textStyle={{ color: "red" }}
            />
          </Pressable>
        </Pressable>
      )}
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
  innerContainer: {
    paddingHorizontal: 20,
  },
  objectivesTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 10,
    color: "#000",
    textAlign: "center",
    backgroundColor: "#fff",
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
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#777",
    marginTop: 8,
    lineHeight: 24,
  },
});
