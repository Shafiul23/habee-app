// components/GridCell.tsx
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { CELL_SIZE } from "../constants/constants";

type Props = {
  completed: boolean;
  inactive: boolean;
};

export default function GridCell({ completed, inactive }: Props) {
  let bgColor = "#eee";

  if (inactive) {
    bgColor = "#e5e5e5";
  } else if (completed) {
    bgColor = "#52c41a";
  } else {
    bgColor = "#ff4d4f";
  }

  return <View style={[styles.cell, { backgroundColor: bgColor }]}></View>;
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
