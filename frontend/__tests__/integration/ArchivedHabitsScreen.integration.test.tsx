import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

import ArchivedHabitsScreen from "../../src/screens/ArchivedHabitsScreen";
import {
  deleteHabit,
  getArchivedHabits,
  unarchiveHabit,
} from "../../lib/api";
import { removeHabitReminder } from "../../lib/habitReminders";

const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
  useFocusEffect: (callback: any) => {
    const React = require("react");
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock("../../lib/api", () => ({
  getArchivedHabits: jest.fn(),
  unarchiveHabit: jest.fn(),
  deleteHabit: jest.fn(),
}));

jest.mock("../../lib/habitReminders", () => ({
  removeHabitReminder: jest.fn(),
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

jest.mock("../../src/components/ArchivedHabitItem", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return function ArchivedHabitItemMock({ item, onShowMenu }: any) {
    return (
      <Pressable onPress={onShowMenu}>
        <Text>{item.name}</Text>
      </Pressable>
    );
  };
});

jest.mock("../../src/components/HabitMenu", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return function HabitMenuMock(props: any) {
    return (
      <>
        <Pressable onPress={props.onUnarchive}>
          <Text>menu-unarchive</Text>
        </Pressable>
        <Pressable onPress={props.onDelete}>
          <Text>menu-delete</Text>
        </Pressable>
      </>
    );
  };
});

describe("ArchivedHabitsScreen integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads archived habits and unarchives from menu", async () => {
    (getArchivedHabits as jest.Mock)
      .mockResolvedValueOnce([
        {
          id: 10,
          name: "Archived Habit",
          start_date: "2026-03-01",
          frequency: "DAILY",
          days_of_week: null,
          pause_start_date: "2026-03-02",
        },
      ])
      .mockResolvedValueOnce([]);
    (unarchiveHabit as jest.Mock).mockResolvedValueOnce({});

    const screen = render(<ArchivedHabitsScreen />);
    await waitFor(() => expect(screen.getByText("Archived Habit")).toBeTruthy());

    fireEvent.press(screen.getByText("Archived Habit"));
    fireEvent.press(screen.getByText("menu-unarchive"));

    await waitFor(() => {
      expect(unarchiveHabit).toHaveBeenCalledWith(10);
      expect(getArchivedHabits).toHaveBeenCalledTimes(2);
    });
  });

  it("deletes archived habit after confirmation", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation((_, __, buttons: any) => {
      const destructive = buttons?.find((b: any) => b.text === "Delete");
      destructive?.onPress?.();
    });

    (getArchivedHabits as jest.Mock).mockResolvedValue([
      {
        id: 22,
        name: "To Delete",
        start_date: "2026-03-01",
        frequency: "DAILY",
        days_of_week: null,
        pause_start_date: "2026-03-02",
      },
    ]);
    (deleteHabit as jest.Mock).mockResolvedValueOnce({});

    const screen = render(<ArchivedHabitsScreen />);
    await waitFor(() => expect(screen.getByText("To Delete")).toBeTruthy());

    fireEvent.press(screen.getByText("To Delete"));
    fireEvent.press(screen.getByText("menu-delete"));

    await waitFor(() => {
      expect(deleteHabit).toHaveBeenCalledWith(22);
      expect(removeHabitReminder).toHaveBeenCalledWith(22);
    });

    alertSpy.mockRestore();
  });
});
