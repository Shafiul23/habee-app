import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import Toast from "react-native-toast-message";
import {
  ArchivedHabit,
  getArchivedHabits,
  unarchiveHabit,
  deleteHabit,
} from "../../lib/api";
import LoadingSpinner from "../components/LoadingSpinner";
import PrimaryButton from "../components/PrimaryButton";
import ArchivedHabitItem from "../components/ArchivedHabitItem";
import HabitMenu from "../components/HabitMenu";
import { removeHabitReminder } from "../../lib/habitReminders";

export default function ArchivedHabitsScreen() {
  const [habits, setHabits] = useState<ArchivedHabit[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHabitMenu, setShowHabitMenu] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigation = useNavigation();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getArchivedHabits();
      setHabits(data);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const handleUnarchive = async (id: number) => {
    try {
      await unarchiveHabit(id);
      setShowHabitMenu(null);
      load();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error unarchiving habit",
        text2: err.response?.data?.error || "Server unreachable.",
      });
    }
  };

  const handleDeleteHabit = (id: number) => {
    Alert.alert(
      "Delete habit?",
      "Are you sure you want to delete this habit? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(id);
            try {
              await deleteHabit(id);
              await removeHabitReminder(id);
              setShowHabitMenu(null);
              load();
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Error deleting habit",
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
    <View style={styles.container}>
      <Text style={styles.title}>Archived habits</Text>
      {loading ? (
        <LoadingSpinner size="large" />
      ) : habits.length === 0 ? (
        <Text style={styles.empty}>No archived habits</Text>
      ) : (
        <ScrollView>
          {habits.map((h) => (
            <ArchivedHabitItem
              key={h.id}
              item={h}
              onShowMenu={() => setShowHabitMenu(h.id)}
            />
          ))}
        </ScrollView>
      )}
      <PrimaryButton title="Close" onPress={() => navigation.goBack()} />
      {showHabitMenu !== null && (
        <HabitMenu
          onClose={() => setShowHabitMenu(null)}
          onUnarchive={() => handleUnarchive(showHabitMenu)}
          onDelete={() => handleDeleteHabit(showHabitMenu)}
          deleting={deletingId === showHabitMenu}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#555",
  },
});
