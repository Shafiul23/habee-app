import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { ArchivedHabit, getArchivedHabits, unarchiveHabit, deleteHabit } from "../../lib/api";
import LoadingSpinner from "../components/LoadingSpinner";
import PrimaryButton from "../components/PrimaryButton";

export default function ArchivedHabitsScreen() {
  const [habits, setHabits] = useState<ArchivedHabit[]>([]);
  const [loading, setLoading] = useState(false);
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
    await unarchiveHabit(id);
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteHabit(id);
    load();
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
            <View key={h.id} style={styles.item}>
              <Text style={styles.name}>{h.name}</Text>
              <View style={styles.actions}>
                <Pressable onPress={() => handleUnarchive(h.id)}>
                  <Text style={styles.actionText}>Unarchive</Text>
                </Pressable>
                <Pressable onPress={() => handleDelete(h.id)} style={{ marginLeft: 12 }}>
                  <Text style={[styles.actionText, { color: "red" }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <PrimaryButton title="Close" onPress={() => navigation.goBack()} />
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
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 18,
  },
  actions: {
    flexDirection: "row",
  },
  actionText: {
    fontSize: 14,
    color: "blue",
  },
});
