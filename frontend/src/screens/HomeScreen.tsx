// frontend/src/screens/HomeScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { addDays, format, isToday, subDays } from "date-fns";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Habit,
  deleteHabit,
  getHabitLogs,
  getHabits,
  logHabit,
  undoHabit,
} from "../../lib/api";
import { RootStackParamList } from "../../types";
import HabitItem from "../components/HabitItem";
import { useAuth } from "../contexts/AuthContext";
import DateHeader from "../components/DateHeader";
import PrimaryButton from "../components/PrimaryButton";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">;

export default function Home() {
  const [date, setDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showHabitMenu, setShowHabitMenu] = useState<number | null>(null);

  const { isLoggedIn } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  useFocusEffect(
    React.useCallback(() => {
      const loadHabits = async () => {
        try {
          const habits = await getHabits();
          const logs = await getHabitLogs(format(date, "yyyy-MM"));

          const completedToday =
            logs[format(date, "yyyy-MM-dd")]?.map((log) => log.id) || [];

          const mergedHabits = habits
            .filter((habit) => new Date(habit.start_date) <= date)
            .map((habit) => ({
              ...habit,
              completed: completedToday.includes(habit.id),
            }));

          setHabits(mergedHabits);
        } catch (err) {
          console.error("Failed to load habits:", err);
        }
      };

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
      <DateHeader date={date} onPrev={goToPrevDay} onNext={goToNextDay} />

      <View style={styles.container}>
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <Text style={styles.objectivesTitle}>
              {format(date, "EEEE")} Habits
            </Text>
          }
          renderItem={({ item }) => (
            <HabitItem
              item={item}
              onToggle={() => handleToggleHabit(item.id, item.completed)}
              onShowMenu={() => setShowHabitMenu(item.id)}
            />
          )}
        />

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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  objectivesTitle: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 30,
    color: "#000",
    backgroundColor: "fff",
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
});
