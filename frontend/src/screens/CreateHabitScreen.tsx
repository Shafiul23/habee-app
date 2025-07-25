import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import api from "../../lib/api";
import PrimaryButton from "../components/PrimaryButton";
import Toast from "react-native-toast-message";

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
      Toast.show({
        type: "success",
        text1: "New habit added",
      });
      navigation.goBack();
    } catch (err) {
      console.error("Failed to create habit:", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>New Habit</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Read 30 mins, Track calories"
          placeholderTextColor="#aaa"
        />
        <PrimaryButton title="Create habit" onPress={handleCreateHabit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    color: "#000",
  },
});
