import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import api, { unarchiveHabit } from "../../lib/api";
import PrimaryButton from "../components/PrimaryButton";
import { isValidHabit } from "../utils/validation";
import { AxiosError } from "axios";

export default function CreateHabitScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateHabit = async () => {
    const { valid, error: validationError } = isValidHabit(name);

    if (!valid) {
      setError(validationError || "Invalid habit name");
      return;
    }

    setLoading(true);

    try {
      await api.post("/habits", {
        name: name.trim(),
        start_date: format(new Date(), "yyyy-MM-dd"),
      });

      setName("");
      setError(null);
      navigation.goBack();
    } catch (err) {
      const error = err as AxiosError<any>;
      if (error.response?.status === 409) {
        const data = error.response.data;
        if (data.error === "duplicate_name_archived") {
          Alert.alert(
            `Habit exists`,
            `You already have an archived habit named '${name.trim()}'. Unarchive it instead, or choose a different name.`,
            [
              {
                text: "Unarchive",
                onPress: async () => {
                  await unarchiveHabit(data.archivedHabitId);
                  navigation.goBack();
                },
              },
              { text: "Choose different name", style: "cancel" },
            ]
          );
        } else if (data.error === "duplicate_name_active") {
          setError(
            `You already have an active habit named '${name.trim()}'. Choose a different name.`
          );
        } else {
          setError(data.error || "Please try again later");
        }
      } else {
        const errorMsg = error?.response?.data?.error || "Please try again later";
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>New Habit</Text>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError(null);
          }}
          placeholder="e.g. Read 30 mins, Track calories"
          placeholderTextColor="#aaa"
          maxLength={128}
          onBlur={() => setName(name.trim())}
        />

        {error && <Text style={styles.errorMessage}>{error}</Text>}

        <PrimaryButton
          title="Create habit"
          onPress={handleCreateHabit}
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
