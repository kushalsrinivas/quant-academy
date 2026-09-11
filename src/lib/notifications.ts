import * as Notifications from "expo-notifications";
import type { SQLiteDatabase } from "expo-sqlite";
import { Platform } from "react-native";

import { getTodayActivity } from "./db/streaks";

const ENABLED_KEY = "notif_enabled";
const ASKED_KEY = "notif_asked";
const REMINDER_HOUR = 20;
const REMINDER_MINUTE = 0;

export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function getSetting(db: SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    key,
  );
  return row?.value ?? null;
}

async function setSetting(db: SQLiteDatabase, key: string, value: string) {
  await db.runAsync(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    key,
    value,
  );
}

export async function isReminderEnabled(db: SQLiteDatabase): Promise<boolean> {
  return (await getSetting(db, ENABLED_KEY)) === "1";
}

export async function wasReminderAsked(db: SQLiteDatabase): Promise<boolean> {
  return (await getSetting(db, ASKED_KEY)) === "1";
}

export async function hasNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === Notifications.PermissionStatus.GRANTED;
}

export async function enableReminders(db: SQLiteDatabase): Promise<boolean> {
  await setSetting(db, ASKED_KEY, "1");
  if (Platform.OS === "web") return false;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== Notifications.PermissionStatus.GRANTED) return false;
  await setSetting(db, ENABLED_KEY, "1");
  await refreshDailyReminder(db);
  return true;
}

export async function disableReminders(db: SQLiteDatabase) {
  await setSetting(db, ENABLED_KEY, "0");
  await cancelScheduledReminders();
}

export async function cancelScheduledReminders() {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function refreshDailyReminder(db: SQLiteDatabase) {
  if (Platform.OS === "web") return;
  if (!(await isReminderEnabled(db))) return;
  if (!(await hasNotificationPermission())) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const activity = await getTodayActivity(db);
  const atRisk = activity.streak > 0 && !activity.goalMet;
  const content: Notifications.NotificationContentInput =
    atRisk
      ? {
          title: `Your ${activity.streak}-day streak is at risk`,
          body: "Complete a lesson to keep it alive.",
        }
      : {
          title: "Time for your daily quant lesson",
          body: "One lesson a day builds a quant.",
        };

  await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: REMINDER_HOUR,
      minute: REMINDER_MINUTE,
    },
  });
}
