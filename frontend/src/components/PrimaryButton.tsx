import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";

type Props = {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
};

export default function PrimaryButton({
  onPress,
  title,
  style,
  textStyle,
  disabled = false,
  loading = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        (disabled || loading) && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#f7ce46",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 6,
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
});
