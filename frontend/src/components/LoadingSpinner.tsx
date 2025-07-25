// components/LoadingSpinner.tsx
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

type LoadingSpinnerProps = {
  size?: number | "small" | "large";
};

export default function LoadingSpinner({
  size = "large",
}: LoadingSpinnerProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
      }}
    >
      <ActivityIndicator size={size} color="#f7ce46" />
      <Text
        style={{
          marginTop: 16,
          color: "#666",
          fontSize: 14,
          textAlign: "center",
          paddingHorizontal: 20,
        }}
      >
        Loading... May take up to a minute if the server is waking up
      </Text>
    </View>
  );
}
