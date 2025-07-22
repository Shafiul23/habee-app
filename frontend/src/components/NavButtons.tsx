// components/NavButtons.tsx
import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";

type Props = {
  showLeft: boolean;
  showRight: boolean;
  onLeft: () => void;
  onRight: () => void;
};

export default function NavButtons({
  showLeft,
  showRight,
  onLeft,
  onRight,
}: Props) {
  return (
    <View style={styles.navButtons}>
      {showLeft ? (
        <Pressable onPress={onLeft}>
          <Text style={styles.navText}>← Back</Text>
        </Pressable>
      ) : (
        <View style={styles.navBtnPlaceholder} />
      )}
      {showRight ? (
        <Pressable onPress={onRight}>
          <Text style={styles.navText}>More habits →</Text>
        </Pressable>
      ) : (
        <View style={styles.navBtnPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  navText: {
    fontSize: 20,
    fontWeight: "600",
  },
  navBtnPlaceholder: {
    width: 32,
  },
});
