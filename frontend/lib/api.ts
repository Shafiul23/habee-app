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

export type HabitLog = {
  habit_id: number;
  date: string; // e.g. "2025-07-15"
};

export type CalendarLog = {
  [date: string]: { id: number; name: string }[];
};

// API Calls
export const getHabits = async (): Promise<Habit[]> => {
  const res = await api.get("/habits");
  return res.data;
};

export const getHabitLogs = async (month: string): Promise<CalendarLog> => {
  const res = await api.get(`/habits/calendar?month=${month}`);
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

export default api;
