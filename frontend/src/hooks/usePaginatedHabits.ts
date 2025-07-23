// hooks/usePaginatedHabits.ts
import { useMemo } from "react";
import { Habit } from "../../lib/api";
import { HABITS_PER_PAGE } from "../constants/constants";

export function usePaginatedHabits(habits: Habit[], currentPage: number) {
  const pageCount = Math.ceil(habits.length / HABITS_PER_PAGE);
  const habitsToDisplay = useMemo(() => {
    const start = currentPage * HABITS_PER_PAGE;
    const end = start + HABITS_PER_PAGE;
    return habits.slice(start, end);
  }, [habits, currentPage]);

  return { pageCount, habitsToDisplay };
}
