import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

const TIME_KEY_PREFIX = "habitReminderTime:";
const NOTIF_KEY_PREFIX = "habitReminderNotificationId:";
const PAUSED_DATE_KEY_PREFIX = "habitReminderPausedDate:";
const CONFIG_KEY_PREFIX = "habitReminderConfig:";

export const MAX_REMINDERS = 20;

function getTimeKey(habitId: number): string {
  return `${TIME_KEY_PREFIX}${habitId}`;
}

function getNotificationKey(habitId: number): string {
  return `${NOTIF_KEY_PREFIX}${habitId}`;
}

function getPausedDateKey(habitId: number): string {
  return `${PAUSED_DATE_KEY_PREFIX}${habitId}`;
}

function getConfigKey(habitId: number): string {
  return `${CONFIG_KEY_PREFIX}${habitId}`;
}

export type ReminderTime = {
  hour: number;
  minute: number;
};

type ReminderFrequency = "DAILY" | "WEEKLY";

type ReminderConfig = {
  habitName: string;
  frequency: ReminderFrequency;
  daysOfWeek?: number[];
};

type ReminderFallback = {
  habitName: string;
  frequency: ReminderFrequency;
  daysOfWeek?: number[];
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

export async function getHabitReminderPausedDate(
  habitId: number
): Promise<string | null> {
  return AsyncStorage.getItem(getPausedDateKey(habitId));
}

async function getHabitReminderConfig(
  habitId: number
): Promise<ReminderConfig | null> {
  const stored = await AsyncStorage.getItem(getConfigKey(habitId));
  return stored ? (JSON.parse(stored) as ReminderConfig) : null;
}

async function setHabitReminderConfig(
  habitId: number,
  config: ReminderConfig
): Promise<void> {
  await AsyncStorage.setItem(getConfigKey(habitId), JSON.stringify(config));
}

async function scheduleNotifications(
  habitId: number,
  habitName: string,
  time: ReminderTime,
  frequency: ReminderFrequency = "DAILY",
  days_of_week?: number[]
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
      const ids: string[] = JSON.parse(existing);
      for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    } catch {
      // ignore
    }
  }

  const ids: string[] = [];

  if (frequency === "WEEKLY" && days_of_week && days_of_week.length) {
    for (const d of days_of_week) {
      const trigger: Notifications.CalendarTriggerInput = {
        weekday: ((d + 1) % 7) + 1,
        hour: time.hour,
        minute: time.minute,
        repeats: true,
        type: SchedulableTriggerInputTypes.CALENDAR,
      };
      const id = await Notifications.scheduleNotificationAsync({
        content: { title: habitName, body: "Time for your habit" },
        trigger,
      });
      ids.push(id);
    }
  } else {
    const trigger: Notifications.CalendarTriggerInput = {
      hour: time.hour,
      minute: time.minute,
      repeats: true,
      type: SchedulableTriggerInputTypes.CALENDAR,
    };
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: habitName, body: "Time for your habit" },
      trigger,
    });
    ids.push(id);
  }

  await AsyncStorage.setItem(getNotificationKey(habitId), JSON.stringify(ids));
  return true;
}

export async function saveHabitReminder(
  habitId: number,
  habitName: string,
  time: ReminderTime,
  frequency: ReminderFrequency = "DAILY",
  days_of_week?: number[]
): Promise<boolean> {
  await AsyncStorage.setItem(getTimeKey(habitId), JSON.stringify(time));
  await setHabitReminderConfig(habitId, {
    habitName,
    frequency,
    daysOfWeek: days_of_week,
  });
  const scheduled = await scheduleNotifications(
    habitId,
    habitName,
    time,
    frequency,
    days_of_week
  );
  if (scheduled) {
    await AsyncStorage.removeItem(getPausedDateKey(habitId));
  }
  return scheduled;
}

export async function pauseHabitReminderForDate(
  habitId: number,
  date: string,
  fallback?: ReminderFallback
): Promise<boolean> {
  const [time, notificationIds] = await Promise.all([
    getHabitReminderTime(habitId),
    AsyncStorage.getItem(getNotificationKey(habitId)),
  ]);

  // Only pause reminders that are currently active.
  if (!time || !notificationIds) return false;

  const existingConfig = await getHabitReminderConfig(habitId);
  if (!existingConfig && fallback) {
    await setHabitReminderConfig(habitId, {
      habitName: fallback.habitName,
      frequency: fallback.frequency,
      daysOfWeek: fallback.daysOfWeek,
    });
  }

  await AsyncStorage.setItem(getPausedDateKey(habitId), date);
  await cancelHabitReminder(habitId);
  return true;
}

export async function resumeHabitReminderForDate(
  habitId: number,
  date: string,
  fallback?: ReminderFallback
): Promise<boolean> {
  const pausedDate = await getHabitReminderPausedDate(habitId);
  if (pausedDate !== date) return false;

  const time = await getHabitReminderTime(habitId);
  if (!time) return false;

  const existingConfig = await getHabitReminderConfig(habitId);
  const config =
    existingConfig ??
    (fallback
      ? {
          habitName: fallback.habitName,
          frequency: fallback.frequency,
          daysOfWeek: fallback.daysOfWeek,
        }
      : null);

  if (!config) return false;

  return saveHabitReminder(
    habitId,
    config.habitName,
    time,
    config.frequency,
    config.daysOfWeek
  );
}

export async function resumePausedHabitRemindersIfNeeded(
  currentDate: string
): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const pausedKeys = keys.filter((k) => k.startsWith(PAUSED_DATE_KEY_PREFIX));

  for (const key of pausedKeys) {
    const id = parseInt(key.split(":")[1], 10);
    if (Number.isNaN(id)) continue;

    const pausedDate = await AsyncStorage.getItem(key);
    if (!pausedDate || pausedDate >= currentDate) continue;

    await resumeHabitReminderForDate(id, pausedDate);
  }
}

export async function cancelHabitReminder(habitId: number): Promise<void> {
  const stored = await AsyncStorage.getItem(getNotificationKey(habitId));
  if (stored) {
    try {
      const ids: string[] = JSON.parse(stored);
      for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    } catch {
      // ignore
    }
    await AsyncStorage.removeItem(getNotificationKey(habitId));
  }
}

export async function removeHabitReminder(habitId: number): Promise<void> {
  await cancelHabitReminder(habitId);
  await Promise.all([
    AsyncStorage.removeItem(getTimeKey(habitId)),
    AsyncStorage.removeItem(getPausedDateKey(habitId)),
    AsyncStorage.removeItem(getConfigKey(habitId)),
  ]);
}
