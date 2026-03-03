import { isApplicable } from "../../src/utils/isApplicable";
import { Habit } from "../../lib/api";

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 1,
    name: "Habit",
    start_date: "2026-03-01",
    frequency: "DAILY",
    ...overrides,
  };
}

describe("isApplicable", () => {
  it("returns false before habit start date", () => {
    const result = isApplicable(habit({ start_date: "2026-03-10" }), new Date("2026-03-09"));
    expect(result).toBe(false);
  });

  it("returns true for DAILY habits on/after start date", () => {
    const result = isApplicable(habit({ frequency: "DAILY" }), new Date("2026-03-03"));
    expect(result).toBe(true);
  });

  it("handles WEEKLY habits using Monday=0 mapping", () => {
    const monday = new Date("2026-03-02T12:00:00Z");
    const tuesday = new Date("2026-03-03T12:00:00Z");
    const weekly = habit({ frequency: "WEEKLY", days_of_week: [0, 2, 4] });

    expect(isApplicable(weekly, monday)).toBe(true);
    expect(isApplicable(weekly, tuesday)).toBe(false);
  });

  it("returns false when date falls inside pause window", () => {
    const paused = habit({
      pauses: [{ start_date: "2026-03-01", end_date: "2026-03-31" }],
    });
    const result = isApplicable(paused, new Date("2026-03-20"));
    expect(result).toBe(false);
  });
});
