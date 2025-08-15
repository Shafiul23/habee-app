// components/ProgressDoughnut.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor?: string;
};

export default function ProgressDoughnut({
  completed,
  total,
  size = 120,
  strokeWidth = 12,
  color,
  trackColor = "#f0f0f0",
}: Props) {
  const progress = total > 0 ? Math.min(1, Math.max(0, completed / total)) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.center}>
        <Text style={styles.topText}>{`${completed}/${total}`}</Text>
        <Text style={styles.subText}>
          {total > 0 ? `${Math.round(progress * 100)}%` : "—"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  topText: { fontSize: 18, fontWeight: "700" },
  subText: { fontSize: 12, opacity: 0.7, marginTop: 2 },
});
