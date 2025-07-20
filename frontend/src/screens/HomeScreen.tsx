// frontend/src/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, subDays, addDays, isToday } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import api, {
  getHabits,
  getHabitLogs,
  logHabit,
  undoHabit,
  Habit,
  deleteHabit,
} from "../../lib/api";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">;

export default function Home() {
  const [date, setDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showHabitMenu, setShowHabitMenu] = useState<number | null>(null);

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
    <View style={styles.container}>
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
              <Pressable onPress={() => setShowHabitMenu(item.id)}>
                <Ionicons name="ellipsis-vertical" size={20} />
              </Pressable>
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

      {/* Habit Options Menu */}
      {showHabitMenu !== null && (
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowHabitMenu(null)}
        >
          <Pressable onPress={() => {}} style={styles.menuBox}>
            <Pressable
              onPress={() => {
                Alert.alert("Edit feature not implemented yet.");
                setShowHabitMenu(null);
              }}
              style={styles.menuButton}
            >
              <Text style={styles.menuEditText}>Edit Habit</Text>
            </Pressable>
            <Pressable
              onPress={() => handleDeleteHabit(showHabitMenu)}
              style={styles.menuButton}
            >
              <Text style={styles.menuDeleteText}>Delete Habit</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}
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
    flexDirection: "row",
    justifyContent: "space-between",
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

  menuButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginVertical: 6,
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  menuEditText: {
    color: "#333",
    fontWeight: "500",
    fontSize: 16,
  },

  menuDeleteText: {
    color: "red",
    fontWeight: "600",
    fontSize: 16,
  },
});
