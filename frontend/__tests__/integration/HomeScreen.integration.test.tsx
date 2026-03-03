import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import HomeScreen from "../../src/screens/HomeScreen";
import { getHabitSummary, getHabits, logHabit } from "../../lib/api";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useFocusEffect: (callback: any) => {
    const React = require("react");
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock("../../lib/api", () => ({
  getHabitSummary: jest.fn(),
  getHabits: jest.fn(),
  logHabit: jest.fn(),
  undoHabit: jest.fn(),
  deleteHabit: jest.fn(),
  archiveHabit: jest.fn(),
}));

jest.mock("../../lib/habitReminders", () => ({
  cancelHabitReminder: jest.fn(),
  removeHabitReminder: jest.fn(),
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

jest.mock("../../src/components/HabitItem", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return function HabitItemMock(props: any) {
    return (
      <Pressable onPress={props.onToggle}>
        <Text>{props.item.name}</Text>
      </Pressable>
    );
  };
});

jest.mock("../../src/components/UpcomingHabitItem", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function UpcomingHabitItemMock({ item }: any) {
    return <Text>{item.name}</Text>;
  };
});

jest.mock("../../src/components/HabitMenu", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function HabitMenuMock() {
    return <Text>menu</Text>;
  };
});

jest.mock("../../src/components/HabitReminderModal", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function HabitReminderModalMock() {
    return <Text>reminder-modal</Text>;
  };
});

jest.mock("../../src/components/SwipeableView", () => {
  const React = require("react");
  const { View } = require("react-native");
  return function SwipeableViewMock({ children }: any) {
    return <View>{children}</View>;
  };
});

jest.mock("../../src/components/HeaderNav", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function HeaderNavMock() {
    return <Text>header</Text>;
  };
});

jest.mock("../../src/components/InfoTooltip", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function InfoTooltipMock() {
    return <Text>info</Text>;
  };
});

describe("HomeScreen integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("true");
  });

  it("loads habits and toggles completion", async () => {
    (getHabitSummary as jest.Mock).mockResolvedValueOnce([
      {
        id: 1,
        name: "Read",
        start_date: "2026-03-01",
        frequency: "DAILY",
        days_of_week: null,
        completed: false,
      },
    ]);
    (getHabits as jest.Mock).mockResolvedValueOnce([
      {
        id: 1,
        name: "Read",
        start_date: "2026-03-01",
        frequency: "DAILY",
        days_of_week: null,
      },
    ]);

    const screen = render(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText("Read")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Read"));
    await waitFor(() => {
      expect(logHabit).toHaveBeenCalledWith(1, expect.any(String));
    });
  });

  it("shows retry state after load failure and retries", async () => {
    (getHabitSummary as jest.Mock)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([]);
    (getHabits as jest.Mock)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([]);

    const screen = render(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText("Retry")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Retry"));

    await waitFor(() => {
      expect(getHabitSummary).toHaveBeenCalledTimes(2);
    });
  });
});
