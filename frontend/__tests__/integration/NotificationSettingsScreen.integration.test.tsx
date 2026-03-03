import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

import * as Notifications from "expo-notifications";
import NotificationSettingsScreen from "../../src/screens/NotificationSettingsScreen";
import { scheduleDailyReminder } from "../../lib/notifications";

jest.mock("expo-notifications", () => ({
  __esModule: true,
  AndroidImportance: { HIGH: "high" },
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
  useFocusEffect: (callback: any) => {
    const React = require("react");
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock("../../lib/notifications", () => ({
  scheduleDailyReminder: jest.fn(),
  cancelAllReminders: jest.fn(),
}));

jest.mock("../../lib/habitReminders", () => ({
  cancelHabitReminder: jest.fn(),
  getHabitReminderTime: jest.fn(),
  removeHabitReminder: jest.fn(),
  saveHabitReminder: jest.fn(),
}));

jest.mock("../../lib/api", () => ({
  getHabits: jest.fn().mockResolvedValue([]),
}));

jest.mock("@react-native-community/datetimepicker", () => "DateTimePicker");

describe("NotificationSettingsScreen integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted" });
  });

  it("alerts when notification permission is denied", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: "denied" });

    render(<NotificationSettingsScreen />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });
    alertSpy.mockRestore();
  });

  it("enables daily reminder and schedules notification", async () => {
    (scheduleDailyReminder as jest.Mock).mockResolvedValueOnce("id-1");

    const screen = render(<NotificationSettingsScreen />);
    const reminderSwitch = await screen.findByTestId("daily-reminder-switch");
    fireEvent(reminderSwitch, "valueChange", true);

    await waitFor(() => {
      expect(scheduleDailyReminder).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("reminderEnabled", "true");
    });
  });
});
