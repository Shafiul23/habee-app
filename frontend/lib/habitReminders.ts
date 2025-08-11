import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

const TIME_KEY_PREFIX = "habitReminderTime:";
const NOTIF_KEY_PREFIX = "habitReminderNotificationId:";

export const MAX_REMINDERS = 20;

function getTimeKey(habitId: number): string {
  return `${TIME_KEY_PREFIX}${habitId}`;
}

function getNotificationKey(habitId: number): string {
  return `${NOTIF_KEY_PREFIX}${habitId}`;
}

export type ReminderTime = {
  hour: number;
  minute: number;
};

export async function getHabitReminderCount(): Promise<number> {
  const keys = await AsyncStorage.getAllKeys();
  return keys.filter((k) => k.startsWith(TIME_KEY_PREFIX)).length;
}

export async function getHabitReminderTime(
  habitId: number
): Promise<ReminderTime | null> {
  const stored = await AsyncStorage.getItem(getTimeKey(habitId));
  return stored ? (JSON.parse(stored) as ReminderTime) : null;
}

async function scheduleNotification(
  habitId: number,
  habitName: string,
  time: ReminderTime
): Promise<boolean> {
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const result = await Notifications.requestPermissionsAsync();
    status = result.status;
  }
  if (status !== "granted") {
    return false;
  }

  const existing = await AsyncStorage.getItem(getNotificationKey(habitId));
  if (existing) {
    try {
      await Notifications.cancelScheduledNotificationAsync(existing);
    } catch {
      // ignore
    }
  }

  const trigger: Notifications.CalendarTriggerInput = {
    hour: time.hour,
    minute: time.minute,
    repeats: true,
    type: SchedulableTriggerInputTypes.CALENDAR,
  };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: habitName,
      body: "Time for your habit",
    },
    trigger,
  });

  await AsyncStorage.setItem(getNotificationKey(habitId), id);
  return true;
}

export async function saveHabitReminder(
  habitId: number,
  habitName: string,
  time: ReminderTime
): Promise<boolean> {
  await AsyncStorage.setItem(getTimeKey(habitId), JSON.stringify(time));
  const scheduled = await scheduleNotification(habitId, habitName, time);
  return scheduled;
}

export async function cancelHabitReminder(habitId: number): Promise<void> {
  const id = await AsyncStorage.getItem(getNotificationKey(habitId));
  if (id) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // ignore
    }
    await AsyncStorage.removeItem(getNotificationKey(habitId));
  }
}

export async function removeHabitReminder(habitId: number): Promise<void> {
  await cancelHabitReminder(habitId);
  await AsyncStorage.removeItem(getTimeKey(habitId));
}
