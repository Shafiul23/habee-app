// components/GridCell.tsx
import React from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  completed: boolean;
  inactive: boolean;
  paused: boolean;
  size: number;
};

export default function GridCell({ completed, inactive, paused, size }: Props) {
  let bgColor = "#eee";

  if (inactive) {
    bgColor = "#e5e5e5";
  } else if (paused) {
    bgColor = "#909090";
  } else if (completed) {
    bgColor = "#52c41a";
  } else {
    bgColor = "#ff4d4f";
  }

  return (
    <View
      style={[
        styles.cell,
        { backgroundColor: bgColor, width: size, height: size },
      ]}
    ></View>
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
    fontSize: 22,
    fontWeight: "900",
    color: "#000",
  },
});
