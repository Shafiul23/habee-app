import { renderHook } from "@testing-library/react-native";

import { Habit } from "../../lib/api";
import { usePaginatedHabits } from "../../src/hooks/usePaginatedHabits";
import { HABITS_PER_PAGE } from "../../src/constants/constants";

const habits: Habit[] = Array.from({ length: HABITS_PER_PAGE + 2 }).map((_, idx) => ({
  id: idx + 1,
  name: `Habit ${idx + 1}`,
  start_date: "2026-03-01",
  frequency: "DAILY",
}));

describe("usePaginatedHabits", () => {
  it("returns the right page count", () => {
    const { result } = renderHook(() => usePaginatedHabits(habits, 0));
    expect(result.current.pageCount).toBe(2);
  });

  it("returns first page slice for page 0", () => {
    const { result } = renderHook(() => usePaginatedHabits(habits, 0));
    expect(result.current.habitsToDisplay).toHaveLength(HABITS_PER_PAGE);
    expect(result.current.habitsToDisplay[0].id).toBe(1);
  });

  it("returns remaining habits for next pages", () => {
    const { result } = renderHook(() => usePaginatedHabits(habits, 1));
    expect(result.current.habitsToDisplay).toHaveLength(2);
    expect(result.current.habitsToDisplay[0].id).toBe(HABITS_PER_PAGE + 1);
  });
});
