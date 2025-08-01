import { useNavigation, useRoute } from "@react-navigation/native";
import { AxiosError } from "axios";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { editHabit } from "../../lib/api";
import PrimaryButton from "../components/PrimaryButton";
import { isValidHabit } from "../utils/validation";

export default function EditHabitScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { habitId, currentName } = route.params;

  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    const { valid, error: validationError } = isValidHabit(name);

    if (!valid) {
      setError(validationError || "Invalid habit name");
      return;
    }

    setLoading(true);

    try {
      await editHabit(habitId, name.trim());
      navigation.goBack();
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      const errorMsg = error?.response?.data?.error || "Please try again later";

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Edit Habit</Text>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError(null);
          }}
          placeholder="Habit name"
          placeholderTextColor="#aaa"
          maxLength={128}
        />
        {error && <Text style={styles.errorMessage}>{error}</Text>}
        <PrimaryButton
          title="Update"
          onPress={handleUpdate}
          loading={loading}
        />
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
  inputError: {
    borderColor: "#c0392b",
  },
  errorMessage: {
    color: "#c0392b",
    fontSize: 13,
    marginBottom: 14,
    textAlign: "left",
  },
});
