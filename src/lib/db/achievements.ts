import type { SQLiteDatabase } from "expo-sqlite";

import { getLessonsForModule } from "../content/loader";
import { MODULES } from "../content/modules";
import type { IconName } from "../content/types";
import { getCompletedLessons } from "./progress";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first_lesson",
    title: "First Steps",
    description: "Complete your first lesson",
    icon: "flag",
  },
  {
    id: "first_trade",
    title: "First Trade",
    description: "Complete Markets 101 Lesson 1",
    icon: "trending-up",
  },
  {
    id: "prob_master",
    title: "Probability Master",
    description: "Complete all probability lessons",
    icon: "dice",
  },
  {
    id: "stat_wizard",
    title: "Statistics Wizard",
    description: "Complete all statistics lessons",
    icon: "bar-chart",
  },
  {
    id: "beat_market",
    title: "Beat the Market",
    description: "Strategy outperforms buy-and-hold",
    icon: "trophy",
  },
  {
    id: "sharp_thinker",
    title: "Sharp Thinker",
    description: "Achieve Sharpe ratio > 1.5",
    icon: "bulb",
  },
  {
    id: "full_stack",
    title: "Full Stack Quant",
    description: "Complete all 10 modules",
    icon: "star",
  },
  {
    id: "quiz_ace",
    title: "Quiz Ace",
    description: "Score 100% on 10 quizzes",
    icon: "ribbon",
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "7-day learning streak",
    icon: "flame",
  },
  {
    id: "streak_30",
    title: "Month Master",
    description: "30-day learning streak",
    icon: "diamond",
  },
  {
    id: "strategy_5",
    title: "Strategy Architect",
    description: "Create 5 strategies",
    icon: "construct",
  },
  {
    id: "microstructure",
    title: "Market Maker",
    description: "Complete market microstructure module",
    icon: "business",
  },
  {
    id: "math_complete",
    title: "Math Genius",
    description: "Complete math for quants module",
    icon: "calculator",
  },
  {
    id: "interview_ready",
    title: "Interview Ready",
    description: "Complete interview prep module",
    icon: "briefcase",
  },
  {
    id: "ten_backtests",
    title: "Backtester",
    description: "Run 10 backtests",
    icon: "flash",
  },
];

export async function unlockAchievement(
  db: SQLiteDatabase,
  achievementId: string,
): Promise<boolean> {
  try {
    await db.runAsync(
      "INSERT OR IGNORE INTO achievements (achievement_id) VALUES (?)",
      achievementId,
    );
    const row = await db.getFirstAsync<{ changes: number }>(
      "SELECT changes() as changes",
    );
    return (row?.changes ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function getUnlockedAchievements(
  db: SQLiteDatabase,
): Promise<string[]> {
  const rows = await db.getAllAsync<{ achievement_id: string }>(
    "SELECT achievement_id FROM achievements",
  );
  return rows.map((r) => r.achievement_id);
}

export async function isAchievementUnlocked(
  db: SQLiteDatabase,
  achievementId: string,
): Promise<boolean> {
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM achievements WHERE achievement_id = ?",
    achievementId,
  );
  return (row?.count ?? 0) > 0;
}

export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENT_DEFS.find((a) => a.id === id);
}

export async function unlockMany(
  db: SQLiteDatabase,
  achievementIds: string[],
): Promise<AchievementDef[]> {
  const newlyUnlocked: AchievementDef[] = [];
  for (const id of achievementIds) {
    if (await unlockAchievement(db, id)) {
      const def = getAchievementDef(id);
      if (def) newlyUnlocked.push(def);
    }
  }
  return newlyUnlocked;
}

const MODULE_ACHIEVEMENTS: Record<string, string> = {
  probability: "prob_master",
  statistics: "stat_wizard",
  "market-microstructure": "microstructure",
  "math-for-quants": "math_complete",
  "interview-prep": "interview_ready",
};

export async function checkLessonAchievements(
  db: SQLiteDatabase,
  moduleId: string,
): Promise<AchievementDef[]> {
  const toUnlock: string[] = ["first_lesson"];
  if (moduleId === "markets-101") {
    const completed = await getCompletedLessons(db, moduleId);
    if (completed.includes("01-what-are-stocks")) {
      toUnlock.push("first_trade");
    }
  }
  const moduleAchievement = MODULE_ACHIEVEMENTS[moduleId];
  if (moduleAchievement) {
    const completed = await getCompletedLessons(db, moduleId);
    const total = getLessonsForModule(moduleId).length;
    if (total > 0 && completed.length >= total) {
      toUnlock.push(moduleAchievement);
    }
  }
  let allComplete = true;
  for (const mod of MODULES) {
    const completed = await getCompletedLessons(db, mod.id);
    const total = getLessonsForModule(mod.id).length;
    if (total === 0 || completed.length < total) {
      allComplete = false;
      break;
    }
  }
  if (allComplete) toUnlock.push("full_stack");
  return unlockMany(db, toUnlock);
}
