// src/components/ToastConfig.tsx
import React from "react";
import { BaseToast, ErrorToast } from "react-native-toast-message";
import type { ToastConfig } from "react-native-toast-message";
import { StyleSheet } from "react-native";

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={styles.toast}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={[styles.toast, { borderLeftColor: "#c0392b" }]}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
};

const styles = StyleSheet.create({
  toast: {
    width: "95%", // Almost full width
    alignSelf: "center", // Centers it if width is less than 100%
    borderRadius: 12,
    borderLeftColor: "#f7ce46",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  text1: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  text2: {
    fontSize: 14,
    color: "#222",
  },
});
