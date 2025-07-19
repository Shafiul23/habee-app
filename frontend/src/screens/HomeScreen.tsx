// frontend/src/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, subDays, addDays, isToday } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import api, {
  getHabits,
  getHabitLogs,
  logHabit,
  undoHabit,
  Habit,
} from "../../lib/api";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">;

export default function Home() {
  const [date, setDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);

  const { isLoggedIn, token } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  useFocusEffect(
    React.useCallback(() => {
      const loadHabits = async () => {
        try {
          const habits = await getHabits();
          const logs = await getHabitLogs(format(date, "yyyy-MM")); // e.g. 2025-07

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

  // Maybe add a delay to avoid too many requests
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

  return (
    <View style={styles.container}>
      {/* <Text style={{ marginBottom: 10 }}>
        {isLoggedIn ? "Logged in ✅" : "Not logged in ❌"}
      </Text>
      {token && (
        <Text numberOfLines={1} style={{ fontSize: 12 }}>
          Token: {token.slice(0, 25)}...
        </Text>
      )} */}
      {/* Date Navigation */}
      <View style={styles.navbar}>
        <Pressable onPress={goToPrevDay}>
          <Ionicons name="chevron-back" size={24} />
        </Pressable>
        <Text style={styles.dateText}>{format(date, "d MMMM yyyy")}</Text>
        <Pressable onPress={goToNextDay} disabled={isToday(date)}>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={isToday(date) ? "gray" : "black"}
          />
        </Pressable>
      </View>

      {/* Habit List Container */}
      <View style={styles.habitContainer}>
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.habit, item.completed && styles.completedHabit]}
              onPress={() => handleToggleHabit(item.id, item.completed)}
            >
              <Text style={styles.habitText}>
                {item.completed ? "✅" : "⬜️"} {item.name}
              </Text>
            </Pressable>
          )}
        />
      </View>
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("CreateHabit")}
      >
        <Ionicons name="create-outline" size={28} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
  },
  habitContainer: {
    flex: 1,
    backgroundColor: "#f9fafb", // subtle off-white / light gray
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  habit: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginBottom: 10,
  },
  completedHabit: {
    backgroundColor: "#c2f0c2",
  },
  habitText: {
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#4CAF50", // or whatever theme color
    padding: 16,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
