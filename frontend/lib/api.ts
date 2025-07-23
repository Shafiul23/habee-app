// frontend/lib/api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "http://192.168.1.118:5050/api",
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

export const getAllHabitLogs = async (habitIds: number[]) => {
  const allLogs: { [date: string]: Set<number> } = {};

  for (const id of habitIds) {
    const logs = await api.get(`/habits/${id}/logs`);
    logs.data.forEach((log: { date: string }) => {
      if (!allLogs[log.date]) allLogs[log.date] = new Set();
      allLogs[log.date].add(id);
    });
  }

  return allLogs;
};

export const getCalendarSummary = async (
  month: string
): Promise<CalendarSummary> => {
  const res = await api.get(`/habits/calendar-summary?month=${month}`);
  return res.data;
};

export const logHabit = async (habitId: number, date: string) => {
  await api.post(`/habits/${habitId}/log`);
};

export const undoHabit = async (habitId: number, date: string) => {
  await api.post(`/habits/${habitId}/unlog`);
};

export const deleteHabit = async (id: number) => {
  return await api.delete(`/habits/${id}`);
};

export const deleteUser = async () => {
  return await api.delete("/auth/delete");
};

export default api;
