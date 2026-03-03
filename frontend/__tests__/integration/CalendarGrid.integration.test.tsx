import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import CalendarGrid from "../../src/components/CalendarGrid";

describe("CalendarGrid integration", () => {
  it("renders status colors and emits selected day", () => {
    const onDayPress = jest.fn();
    const screen = render(
      <CalendarGrid
        month={new Date("2026-03-01")}
        summary={{
          "2026-03-01": { status: "complete", completed: 2, total: 2 },
          "2026-03-02": { status: "partial", completed: 1, total: 2 },
          "2026-03-03": { status: "incomplete", completed: 0, total: 2 },
        }}
        onDayPress={onDayPress}
      />
    );

    const completeCell = screen.getByTestId("calendar-cell-2026-03-01");
    const partialCell = screen.getByTestId("calendar-cell-2026-03-02");
    const incompleteCell = screen.getByTestId("calendar-cell-2026-03-03");

    expect(completeCell).toHaveStyle({ backgroundColor: "#52c41a" });
    expect(partialCell).toHaveStyle({ backgroundColor: "#f7ce46" });
    expect(incompleteCell).toHaveStyle({ backgroundColor: "#ff4d4f" });

    fireEvent.press(incompleteCell);
    expect(onDayPress).toHaveBeenCalledTimes(1);
  });
});
