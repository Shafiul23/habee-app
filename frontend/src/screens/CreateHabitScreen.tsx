import { useNavigation } from "@react-navigation/native";
import { AxiosError } from "axios";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { addDays, format } from "date-fns";
import { createHabit, unarchiveHabit, Habit } from "../../lib/api";
import { isApplicable } from "../utils/isApplicable";
import PrimaryButton from "../components/PrimaryButton";
import { isValidHabit } from "../utils/validation";

export default function CreateHabitScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY">("DAILY");
  const [days, setDays] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const weekLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const previewDates = () => {
    const habit: Habit = {
      id: 0,
      name,
      start_date: format(new Date(), "yyyy-MM-dd"),
      frequency,
      days_of_week: days,
    };
    const res: string[] = [];
    let d = new Date();
    while (res.length < 3) {
      if (isApplicable(habit, d)) {
        res.push(format(d, "EEE MMM d"));
      }
      d = addDays(d, 1);
    }
    return res;
  };

  const handleCreateHabit = async () => {
    const { valid, error: validationError } = isValidHabit(name);

    if (!valid) {
      setError(validationError || "Invalid habit name");
      return;
    }

    setLoading(true);

    if (frequency === "WEEKLY" && days.length === 0) {
      setError("Select at least one day");
      return;
    }

    try {
      await createHabit(
        name.trim(),
        format(new Date(), "yyyy-MM-dd"),
        frequency,
        days
      );

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
        const errorMsg =
          error?.response?.data?.error || "Please try again later";
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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

        <Text style={styles.subLabel}>Frequency</Text>
        <View style={styles.freqRow}>
          {(["DAILY", "WEEKLY"] as const).map((f) => (
            <Pressable
              key={f}
              style={[styles.chip, frequency === f && styles.chipSelected]}
              onPress={() => setFrequency(f)}
            >
              <Text
                style={[styles.chipText, frequency === f && styles.chipTextSel]}
              >
                {f === "DAILY" ? "Daily" : "Weekly"}
              </Text>
            </Pressable>
          ))}
        </View>

        {frequency === "WEEKLY" && (
          <View>
            <Text style={styles.subLabel}>Days of Week</Text>
            <View style={styles.weekRow}>
              {weekLabels.map((label, idx) => {
                const selected = days.includes(idx);
                return (
                  <Pressable
                    key={idx}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => {
                      setDays((prev) =>
                        prev.includes(idx)
                          ? prev.filter((d) => d !== idx)
                          : [...prev, idx]
                      );
                    }}
                  >
                    <Text
                      style={[styles.chipText, selected && styles.chipTextSel]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {frequency === "WEEKLY" && (
          <View style={styles.previewBox}>
            <Text style={styles.subLabel}>Next 3 occurrences</Text>
            {previewDates().map((d) => (
              <Text key={d} style={styles.previewText}>
                {d}
              </Text>
            ))}
          </View>
        )}

        <PrimaryButton
          title="Create habit"
          onPress={handleCreateHabit}
          loading={loading}
        />
      </View>
    </KeyboardAvoidingView>
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
  subLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
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
  freqRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  chipSelected: {
    backgroundColor: "#f7ce46",
    borderColor: "#f7ce46",
  },
  chipText: {
    color: "#000",
    fontSize: 14,
  },
  chipTextSel: {
    fontWeight: "700",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  previewBox: {
    marginBottom: 16,
  },
  previewText: {
    fontSize: 14,
    color: "#000",
  },
});
