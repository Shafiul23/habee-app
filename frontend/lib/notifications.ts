// lib/notifications.ts
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

export async function scheduleDailyReminder(hour: number, minute: number) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const trigger: Notifications.CalendarTriggerInput = {
    hour,
    minute,
    repeats: true,
    type: SchedulableTriggerInputTypes.CALENDAR,
  };

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily reminder",
      body: "Don't forget to log your habits today!",
    },
    trigger,
  });
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
