import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import api from "../../lib/api";

export default function CreateHabitScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState("");

  const handleCreateHabit = async () => {
    if (!name.trim()) return;

    try {
      await api.post("/habits", {
        name: name.trim(),
        start_date: format(new Date(), "yyyy-MM-dd"),
      });
      setName("");
      navigation.goBack();
    } catch (err) {
      console.error("Failed to create habit:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Habit Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Read 30 mins, Track calories"
      />

      <Button title="Create Habit" onPress={handleCreateHabit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 80 },
  label: { marginBottom: 6, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
});
