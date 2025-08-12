// components/GridCell.tsx
import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  applicable: boolean;
  status?: "complete" | "missed" | "unlogged";
  size: number;
  paused?: boolean;
}

export default function GridCell({ applicable, status, size, paused }: Props) {
  let bgColor = "#e5e5e5";

  if (paused) {
    bgColor = "#909090";
  } else if (!applicable) {
    bgColor = "#e5e5e5";
  } else if (status === "complete") {
    bgColor = "#52c41a";
  } else if (status === "missed") {
    bgColor = "#ff4d4f";
  }

  return (
    <View style={[styles.cell, { backgroundColor: bgColor, width: size, height: size }]} />
  );
}

const styles = StyleSheet.create({
  cell: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    margin: 2,
  },
});
