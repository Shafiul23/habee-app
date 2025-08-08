import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import api from "../../lib/api";
import PrimaryButton from "../components/PrimaryButton";
import { isValidHabit } from "../utils/validation";
import { AxiosError } from "axios";
import { useGlobalStyles } from "../styles/theme";
import { useTheme } from "../contexts/ThemeContext";

export default function CreateHabitScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const globalStyles = useGlobalStyles();
  const { colors } = useTheme();
  const styles = getStyles(colors);

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
      const error = err as AxiosError<{ error?: string }>;
      const errorMsg = error?.response?.data?.error || "Please try again later";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[globalStyles.screen, styles.container]}>
      <View style={styles.card}>
        <Text style={[globalStyles.text, styles.label]}>New Habit</Text>
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
const getStyles = (colors: { background: string; text: string }) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    card: {
      width: "100%",
      backgroundColor: colors.background,
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
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
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
