// frontend/src/screens/HomeScreen.tsx
import React, { useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, subDays, addDays, isToday } from "date-fns";
import { useAuth } from "../contexts/AuthContext";

const mockHabits = [
  { id: "1", name: "Pray Fajr", completed: false },
  { id: "2", name: "Read Qur’an", completed: true },
  { id: "3", name: "Workout", completed: false },
];

export default function Home() {
  const [date, setDate] = useState(new Date());
  const [habits, setHabits] = useState(mockHabits);

  const { isLoggedIn, token } = useAuth();

  const handleToggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  const goToPrevDay = () => setDate(subDays(date, 1));
  const goToNextDay = () => {
    if (!isToday(date)) setDate(addDays(date, 1));
  };

  return (
    <View style={styles.container}>
      <Text style={{ marginBottom: 10 }}>
        {isLoggedIn ? "Logged in ✅" : "Not logged in ❌"}
      </Text>
      {token && (
        <Text numberOfLines={1} style={{ fontSize: 12 }}>
          Token: {token.slice(0, 25)}...
        </Text>
      )}
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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.habit, item.completed && styles.completedHabit]}
              onPress={() => handleToggleHabit(item.id)}
            >
              <Text style={styles.habitText}>
                {item.completed ? "✅" : "⬜️"} {item.name}
              </Text>
            </Pressable>
          )}
        />
      </View>
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
});
