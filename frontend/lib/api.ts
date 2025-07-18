// frontend/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.118:5050/api",
  withCredentials: true,
});

// // Types
// export type Habit = {
//   id: number;
//   name: string;
//   start_date: string; // e.g. "2025-07-01"
// };

// export type HabitLog = {
//   habit_id: number;
//   date: string; // e.g. "2025-07-15"
// };

// // API Calls
// export const getHabits = async (): Promise<Habit[]> => {
//   const res = await api.get("/habits");
//   return res.data;
// };

// export const getHabitLogs = async (month: string): Promise<HabitLog[]> => {
//   const res = await api.get(`/habit-logs?month=${month}`);
//   return res.data;
// };

// export const logHabit = async (habitId: number, date: string) => {
//   await api.post(`/habits/${habitId}/log`);
// };

// export const undoHabit = async (habitId: number, date: string) => {
//   await api.post(`/habits/${habitId}/unlog`);
// };

export default api;
