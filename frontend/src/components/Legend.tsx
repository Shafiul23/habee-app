import React from "react";
import { StyleSheet, Text, View } from "react-native";

type LegendItem = {
  label: string;
  color: string;
};

const defaultLegendData: LegendItem[] = [
  { label: "Complete", color: "#52c41a" },
  { label: "Missed", color: "#ff4d4f" },
  { label: "Unlogged", color: "#e5e5e5" },
  { label: "Inactive (not scheduled)", color: "#909090" },
];

type LegendProps = {
  data?: LegendItem[];
};

export default function Legend({ data = defaultLegendData }: LegendProps) {
  return (
    <View style={styles.legendRow}>
      {data.map(({ label, color }) => (
        <View key={label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: color }]} />
          <Text style={styles.legendLabel}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 12,
  },
});
