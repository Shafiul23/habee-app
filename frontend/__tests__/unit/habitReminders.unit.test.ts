import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

import {
  cancelHabitReminder,
  getHabitReminderCount,
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
});
