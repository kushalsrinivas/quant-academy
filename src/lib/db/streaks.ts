import type { SQLiteDatabase } from "expo-sqlite";

import { unlockAchievement } from "./achievements";
import { addXP, hasEarnedXPFor, XP_VALUES } from "./xp";

export const DAILY_GOAL_KEY = "daily_goal_lessons";
export const BEST_STREAK_KEY = "best_streak";
export const DEFAULT_DAILY_GOAL = 1;

export interface DayActivity {
  lessonsToday: number;
  xpToday: number;
  goal: number;
  goalMet: boolean;
  streak: number;
  bestStreak: number;
}

export function getTodayKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shiftDayKey(dayKey: string, deltaDays: number): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + deltaDays);
  return getTodayKey(date);
}

export async function getDailyGoal(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    DAILY_GOAL_KEY,
  );
  const parsed = Number.parseInt(row?.value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_GOAL;
}

export async function setDailyGoal(db: SQLiteDatabase, lessons: number) {
  const clamped = Math.min(10, Math.max(1, Math.floor(lessons)));
  await db.runAsync(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    DAILY_GOAL_KEY,
    String(clamped),
  );
}

async function getBestStreak(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    BEST_STREAK_KEY,
  );
  const parsed = Number.parseInt(row?.value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export async function getStreak(db: SQLiteDatabase): Promise<number> {
  const rows = await db.getAllAsync<{ day: string }>(
    "SELECT day FROM activity_days WHERE goal_met = 1 ORDER BY day DESC LIMIT 400",
  );
  if (rows.length === 0) return 0;
  const metDays = new Set(rows.map((r) => r.day));
  const today = getTodayKey();
  let cursor = metDays.has(today) ? today : shiftDayKey(today, -1);
  let streak = 0;
  while (metDays.has(cursor)) {
    streak += 1;
    cursor = shiftDayKey(cursor, -1);
  }
  return streak;
}

export async function getTodayActivity(db: SQLiteDatabase): Promise<DayActivity> {
  const [goal, bestStreak, streak] = await Promise.all([
    getDailyGoal(db),
    getBestStreak(db),
    getStreak(db),
  ]);
  const row = await db.getFirstAsync<{
    lessons: number;
    xp: number;
    goal_met: number;
  }>("SELECT lessons, xp, goal_met FROM activity_days WHERE day = ?", getTodayKey());
  return {
    lessonsToday: row?.lessons ?? 0,
    xpToday: row?.xp ?? 0,
    goal,
    goalMet: (row?.goal_met ?? 0) === 1,
    streak,
    bestStreak: Math.max(bestStreak, streak),
  };
}

export async function recordActivity(
  db: SQLiteDatabase,
  delta: { lessons?: number; xp?: number },
): Promise<DayActivity> {
  const lessonsDelta = Math.max(0, Math.floor(delta.lessons ?? 0));
  const xpDelta = Math.max(0, Math.floor(delta.xp ?? 0));
  if (lessonsDelta === 0 && xpDelta === 0) {
    return getTodayActivity(db);
  }

  const goal = await getDailyGoal(db);
  const today = getTodayKey();
  await db.runAsync(
    `INSERT INTO activity_days (day, lessons, xp, goal_met)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(day) DO UPDATE SET
       lessons = activity_days.lessons + excluded.lessons,
       xp = activity_days.xp + excluded.xp,
       goal_met = CASE WHEN activity_days.lessons + excluded.lessons >= ? THEN 1 ELSE 0 END`,
    today,
    lessonsDelta,
    xpDelta,
    lessonsDelta >= goal ? 1 : 0,
    goal,
  );

  const row = await db.getFirstAsync<{
    lessons: number;
    xp: number;
    goal_met: number;
  }>("SELECT lessons, xp, goal_met FROM activity_days WHERE day = ?", today);
  const goalMet = (row?.goal_met ?? 0) === 1;

  if (goalMet && !(await hasEarnedXPFor(db, "streak", today))) {
    await addXP(db, XP_VALUES.streak, "streak", today);
  }

  const streak = await getStreak(db);
  const prevBest = await getBestStreak(db);
  const bestStreak = Math.max(prevBest, streak);
  if (bestStreak > prevBest) {
    await db.runAsync(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      BEST_STREAK_KEY,
      String(bestStreak),
    );
  }

  if (streak >= 7) await unlockAchievement(db, "streak_7");
  if (streak >= 30) await unlockAchievement(db, "streak_30");

  return {
    lessonsToday: row?.lessons ?? 0,
    xpToday: row?.xp ?? 0,
    goal,
    goalMet,
    streak,
    bestStreak,
  };
}
