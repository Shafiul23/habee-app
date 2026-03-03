import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

import {
  cancelHabitReminder,
  getHabitReminderCount,
  pauseHabitReminderForDate,
  removeHabitReminder,
  resumeHabitReminderForDate,
  resumePausedHabitRemindersIfNeeded,
  saveHabitReminder,
} from "../../lib/habitReminders";

jest.mock("expo-notifications", () => ({
  __esModule: true,
  SchedulableTriggerInputTypes: { CALENDAR: "calendar" },
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
}));

describe("habitReminders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("counts reminder keys by prefix", async () => {
    (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValueOnce([
      "habitReminderTime:1",
      "habitReminderTime:2",
      "other:key",
    ]);

    const count = await getHabitReminderCount();
    expect(count).toBe(2);
  });

  it("saves and schedules one daily reminder", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: "granted" });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce("notif-1");

    const ok = await saveHabitReminder(7, "Read", { hour: 9, minute: 30 }, "DAILY");

    expect(ok).toBe(true);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "habitReminderNotificationId:7",
      JSON.stringify(["notif-1"])
    );
  });

  it("schedules one reminder per selected weekday for weekly frequency", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: "granted" });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    (Notifications.scheduleNotificationAsync as jest.Mock)
      .mockResolvedValueOnce("n1")
      .mockResolvedValueOnce("n2");

    const ok = await saveHabitReminder(
      8,
      "Workout",
      { hour: 7, minute: 0 },
      "WEEKLY",
      [0, 3]
    );

    expect(ok).toBe(true);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
  });

  it("cancels stored notification ids", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(["a", "b"]));

    await cancelHabitReminder(11);

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("habitReminderNotificationId:11");
  });

  it("pauses an active reminder for a given date", async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === "habitReminderTime:3") {
        return Promise.resolve(JSON.stringify({ hour: 8, minute: 15 }));
      }
      if (key === "habitReminderNotificationId:3") {
        return Promise.resolve(JSON.stringify(["n-1"]));
      }
      if (key === "habitReminderConfig:3") {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    });

    const paused = await pauseHabitReminderForDate(3, "2026-03-03", {
      habitName: "Read",
      frequency: "DAILY",
    });

    expect(paused).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "habitReminderPausedDate:3",
      "2026-03-03"
    );
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("habitReminderNotificationId:3");
  });

  it("reactivates a paused reminder for the same date", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: "granted" });
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce("new-id");
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === "habitReminderPausedDate:3") return Promise.resolve("2026-03-03");
      if (key === "habitReminderTime:3") {
        return Promise.resolve(JSON.stringify({ hour: 8, minute: 15 }));
      }
      if (key === "habitReminderConfig:3") {
        return Promise.resolve(
          JSON.stringify({
            habitName: "Read",
            frequency: "DAILY",
          })
        );
      }
      if (key === "habitReminderNotificationId:3") return Promise.resolve(null);
      return Promise.resolve(null);
    });

    const resumed = await resumeHabitReminderForDate(3, "2026-03-03");

    expect(resumed).toBe(true);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("habitReminderPausedDate:3");
  });

  it("restores reminders paused on older dates", async () => {
    (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValueOnce([
      "habitReminderPausedDate:5",
    ]);
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: "granted" });
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce("restored-id");
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === "habitReminderPausedDate:5") return Promise.resolve("2026-03-01");
      if (key === "habitReminderTime:5") {
        return Promise.resolve(JSON.stringify({ hour: 6, minute: 45 }));
      }
      if (key === "habitReminderConfig:5") {
        return Promise.resolve(
          JSON.stringify({
            habitName: "Workout",
            frequency: "WEEKLY",
            daysOfWeek: [1, 3, 5],
          })
        );
      }
      if (key === "habitReminderNotificationId:5") return Promise.resolve(null);
      return Promise.resolve(null);
    });

    await resumePausedHabitRemindersIfNeeded("2026-03-03");

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);
  });

  it("fully removes reminder data", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(["a", "b"]));

    await removeHabitReminder(13);

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("habitReminderNotificationId:13");
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("habitReminderTime:13");
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("habitReminderPausedDate:13");
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("habitReminderConfig:13");
  });
});
