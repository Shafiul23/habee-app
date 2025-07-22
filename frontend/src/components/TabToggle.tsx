import React, { useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

export default function TabToggle() {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [underlineAnim] = useState(new Animated.Value(0)); // 0 for left, 1 for right

  const switchView = (mode: "month" | "week") => {
    setViewMode(mode);
    Animated.timing(underlineAnim, {
      toValue: mode === "month" ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  return (
    <View style={styles.toggleWrapper}>
      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.tabButton, viewMode === "month" && styles.tabSelected]}
          onPress={() => switchView("month")}
        >
          <Text
            style={[styles.tabText, viewMode === "month" && styles.tabActive]}
          >
            Month View
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, viewMode === "week" && styles.tabSelected]}
          onPress={() => switchView("week")}
        >
          <Text
            style={[styles.tabText, viewMode === "week" && styles.tabActive]}
          >
            Week View
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 100,
  },
  toggleWrapper: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
    position: "relative",
  },
  toggleContainer: {
    flexDirection: "row",
  },
  tabButton: {
    flex: 1, // take equal space
    alignItems: "center",
    paddingVertical: 10,
  },

  tabText: {
    fontSize: 16,
    color: "#888",
  },
  tabActive: {
    fontWeight: "bold",
    color: "#000",
  },
  tabSelected: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
});
