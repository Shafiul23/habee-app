import * as Notifications from "expo-notifications";

import { cancelAllReminders, scheduleDailyReminder } from "../../lib/notifications";

jest.mock("expo-notifications", () => ({
  __esModule: true,
  SchedulableTriggerInputTypes: { CALENDAR: "calendar" },
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));

describe("notifications lib", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("cancels old reminders and schedules a daily reminder", async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce("daily-id");

    const id = await scheduleDailyReminder(20, 15);

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: expect.objectContaining({
          hour: 20,
          minute: 15,
          repeats: true,
        }),
      })
    );
    expect(id).toBe("daily-id");
  });

  it("cancels all reminders", async () => {
    await cancelAllReminders();
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });
});
