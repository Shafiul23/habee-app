// frontend/lib/api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Types
export type HabitPause = {
  start_date: string;
  end_date: string | null;
};

export type Habit = {
  id: number;
  name: string;
  start_date: string;
  completed?: boolean;
  pauses?: HabitPause[];
};

export type ArchivedHabit = Habit & {
  pause_start_date: string;
};

export type CalendarSummary = {
  [date: string]: {
    status: "inactive" | "incomplete" | "partial" | "complete" | "future";
    completed?: number;
    total?: number;
  };
};

// API Calls
export const getHabits = async (date?: string): Promise<Habit[]> => {
  const res = await api.get(date ? `/habits?date=${date}` : `/habits`);
  return res.data;
};

export const getHabitSummary = async (date: string): Promise<Habit[]> => {
  const res = await api.get(`/habits/daily-summary?date=${date}`);
  return res.data;
};

export const getHabitLogSummary = async (
  month: string
): Promise<Record<string, Set<number>>> => {
  const res = await api.get(`/habits/log-summary?month=${month}`);
  const data = res.data;

  const result: Record<string, Set<number>> = {};
  for (const date in data) {
    result[date] = new Set(data[date]);
  }

  return result;
};

export const getCalendarSummary = async (
  month: string
): Promise<CalendarSummary> => {
  const res = await api.get(`/habits/calendar-summary?month=${month}`);
  return res.data;
};

export const getArchivedHabits = async (): Promise<ArchivedHabit[]> => {
  const res = await api.get(`/habits/archived`);
  return res.data;
};

export const logHabit = async (habitId: number, date: string) => {
  await api.post(`/habits/${habitId}/log`, { date });
};

export const undoHabit = async (habitId: number, date: string) => {
  await api.post(`/habits/${habitId}/unlog`, { date });
};

export const archiveHabit = async (habitId: number) => {
  await api.post(`/habits/${habitId}/archive`);
};

export const unarchiveHabit = async (habitId: number) => {
  await api.post(`/habits/${habitId}/unarchive`);
};

export const editHabit = async (id: number, name: string) => {
  return await api.put(`/habits/${id}`, { name });
};

export const deleteHabit = async (id: number) => {
  return await api.delete(`/habits/${id}`);
};

export const deleteUser = async () => {
  return await api.delete("/auth/delete");
};

export default api;
