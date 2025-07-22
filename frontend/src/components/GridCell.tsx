// components/GridCell.tsx
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

type Props = {
  completed: boolean;
  inactive: boolean;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const HABITS_PER_PAGE = 5;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 40) / (HABITS_PER_PAGE + 1));

export default function GridCell({ completed, inactive }: Props) {
  let bgColor = "#eee";
  let symbol = "";

  if (inactive) {
    bgColor = "#e5e5e5";
  } else if (completed) {
    bgColor = "#52c41a";
    symbol = "✓";
  } else {
    bgColor = "#ff4d4f";
    symbol = "✗";
  }

  return (
    <View style={[styles.cell, { backgroundColor: bgColor }]}>
      <Text style={styles.icon}>{symbol}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    margin: 2,
  },
  icon: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000",
  },
});
