import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import GridScreen from "../../src/screens/GridScreen";
import { getHabits } from "../../lib/api";

jest.mock("../../lib/api", () => ({
  getHabits: jest.fn(),
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

jest.mock("../../src/components/HeaderNav", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function HeaderNavMock() {
    return <Text>header</Text>;
  };
});

jest.mock("../../src/components/WeeklyGrid", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function WeeklyGridMock() {
    return <Text>weekly-grid</Text>;
  };
});

describe("GridScreen integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retries after load failure", async () => {
    (getHabits as jest.Mock)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([]);

    const screen = render(<GridScreen />);

    await waitFor(() => {
      expect(screen.getByText("Retry")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Retry"));

    await waitFor(() => {
      expect(getHabits).toHaveBeenCalledTimes(2);
    });
  });

  it("renders grid with data", async () => {
    (getHabits as jest.Mock).mockResolvedValueOnce([
      { id: 1, name: "Habit", start_date: "2026-03-01", frequency: "DAILY" },
    ]);

    const screen = render(<GridScreen />);

    await waitFor(() => {
      expect(screen.getByText("weekly-grid")).toBeTruthy();
    });
  });
});
