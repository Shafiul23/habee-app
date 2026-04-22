import { render, waitFor } from "@testing-library/react-native";
import { format, startOfMonth } from "date-fns";
import React from "react";

import CalendarScreen from "../../src/screens/CalendarScreen";
import { getCalendarSummary } from "../../lib/api";

jest.mock("../../lib/api", () => ({
  getCalendarSummary: jest.fn(),
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

jest.mock("../../src/components/SelectedDayCard", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function SelectedDayCardMock() {
    return <Text>selected-day</Text>;
  };
});

describe("CalendarScreen integration", () => {
  it("loads summary and renders calendar cells", async () => {
    const selectedMonth = new Date();
    const month = format(selectedMonth, "yyyy-MM");
    const firstDay = format(startOfMonth(selectedMonth), "yyyy-MM-dd");

    (getCalendarSummary as jest.Mock).mockResolvedValueOnce({
      [firstDay]: { status: "complete", completed: 2, total: 2 },
    });

    const screen = render(<CalendarScreen />);

    await waitFor(() => {
      expect(getCalendarSummary).toHaveBeenCalledWith(month);
    });

    expect(screen.getByTestId(`calendar-cell-${firstDay}`)).toBeTruthy();
  });
});
