// frontend/lib/api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { EXPO_PUBLIC_API_URL } from "@env";

const api = axios.create({
  baseURL: EXPO_PUBLIC_API_URL,
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
export type Habit = {
  id: number;
  name: string;
  start_date: string;
  completed?: boolean;
};

export type CalendarSummary = {
  [date: string]: {
    status: "inactive" | "incomplete" | "partial" | "complete" | "future";
    completed?: number;
    total?: number;
  };
};

// API Calls
export const getHabits = async (): Promise<Habit[]> => {
  const res = await api.get("/habits");
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

export const logHabit = async (habitId: number, date: string) => {
  await api.post(`/habits/${habitId}/log`, { date });
};

export const undoHabit = async (habitId: number, date: string) => {
  await api.post(`/habits/${habitId}/unlog`, { date });
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
