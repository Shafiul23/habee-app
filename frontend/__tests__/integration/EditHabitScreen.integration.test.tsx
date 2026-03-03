import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import EditHabitScreen from "../../src/screens/EditHabitScreen";
import { editHabit } from "../../lib/api";

const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
  useRoute: () => ({
    params: {
      habitId: 7,
      currentName: "Read",
      frequency: "DAILY",
      daysOfWeek: [],
    },
  }),
}));

jest.mock("../../lib/api", () => ({
  editHabit: jest.fn(),
  unarchiveHabit: jest.fn(),
}));

describe("EditHabitScreen integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires at least one day when weekly is selected", async () => {
    const screen = render(<EditHabitScreen />);
    fireEvent.press(screen.getByText("Weekly"));
    fireEvent.press(screen.getByText("Update"));

    await waitFor(() => {
      expect(screen.queryByText("Select at least one day")).toBeTruthy();
    });
  });

  it("submits updated habit and navigates back", async () => {
    (editHabit as jest.Mock).mockResolvedValueOnce({});
    const screen = render(<EditHabitScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("Habit name"), "Read More");
    fireEvent.press(screen.getByText("Update"));

    await waitFor(() => {
      expect(editHabit).toHaveBeenCalledWith(7, "Read More", "DAILY", []);
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});
