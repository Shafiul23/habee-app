import { Habit } from "../../lib/api";
import { parseISO, getDay } from "date-fns";

export function isApplicable(habit: Habit, date: Date): boolean {
  const start = parseISO(habit.start_date);
  if (date < start) return false;

  if (habit.pauses?.some((p) => {
    const s = parseISO(p.start_date);
    const e = p.end_date ? parseISO(p.end_date) : null;
    return date >= s && (!e || date <= e);
  })) {
    return false;
  }

  if (habit.frequency === "DAILY") return true;
  if (habit.frequency === "WEEKLY") {
    if (!habit.days_of_week || habit.days_of_week.length === 0) return false;
    const weekday = getDay(date); // 0 = Sunday
    return habit.days_of_week.includes(weekday);
  }
  return true;
}
