import { render, waitFor } from "@testing-library/react-native";
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
    (getCalendarSummary as jest.Mock).mockResolvedValueOnce({
      "2026-03-01": { status: "complete", completed: 2, total: 2 },
    });

    const screen = render(<CalendarScreen />);

    await waitFor(() => {
      expect(getCalendarSummary).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId("calendar-cell-2026-03-01")).toBeTruthy();
  });
});
