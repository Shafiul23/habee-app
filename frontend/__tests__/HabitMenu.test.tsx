import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import HabitMenu from "../src/components/HabitMenu";
import { getHabitReminderTime } from "../lib/habitReminders";

jest.mock("../lib/habitReminders", () => ({
  getHabitReminderTime: jest.fn(),
}));

describe("HabitMenu", () => {
  const defaultProps = {
    onClose: jest.fn(),
    onDelete: jest.fn(),
    deleting: false,
    habitId: 1,
    onReminder: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows no-reminder text when no custom reminder is set", async () => {
    (getHabitReminderTime as jest.Mock).mockResolvedValueOnce(null);

    const screen = render(<HabitMenu {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("No reminder set")).toBeTruthy();
    });
    expect(screen.queryByText(/Reminder set for/i)).toBeNull();
  });

  it("shows reminder copy with time when reminder exists", async () => {
    (getHabitReminderTime as jest.Mock).mockResolvedValueOnce({
      hour: 9,
      minute: 30,
    });

    const screen = render(<HabitMenu {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Reminder set for: 09:30")).toBeTruthy();
    });
    expect(screen.queryByText("No reminder set")).toBeNull();
  });
});
