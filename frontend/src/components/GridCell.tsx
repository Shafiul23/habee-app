// components/GridCell.tsx
import React from "react";
import { StyleSheet, View, Text } from "react-native";

interface Props {
  applicable: boolean;
  status?: "complete" | "missed" | "unlogged";
  size: number;
}

export default function GridCell({ applicable, status, size }: Props) {
  let bgColor = "#d3d3d3";
  let symbol = "";

  if (!applicable) {
    bgColor = "#d3d3d3";
    symbol = "-";
  } else if (status === "complete") {
    bgColor = "#52c41a";
  } else if (status === "missed") {
    bgColor = "#ff4d4f";
  } else {
    bgColor = "#e5e5e5";
  }

  return (
    <View style={[styles.cell, { backgroundColor: bgColor, width: size, height: size }]}>
      {symbol ? <Text style={styles.icon}>{symbol}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    margin: 2,
  },
  icon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
});
