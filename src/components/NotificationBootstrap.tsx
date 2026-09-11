import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { AppState } from "react-native";

import {
  refreshDailyReminder,
  setupNotificationHandler,
} from "@/lib/notifications";

export function NotificationBootstrap() {
  const db = useSQLiteContext();

  useEffect(() => {
    setupNotificationHandler();
    refreshDailyReminder(db).catch(() => {});
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refreshDailyReminder(db).catch(() => {});
      }
    });
    return () => sub.remove();
  }, [db]);

  return null;
}
