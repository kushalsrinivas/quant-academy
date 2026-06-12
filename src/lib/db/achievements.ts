import type { SQLiteDatabase } from "expo-sqlite";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first_lesson",
    title: "First Steps",
    description: "Complete your first lesson",
    icon: "flag-outline",
  },
  {
    id: "first_trade",
    title: "First Trade",
    description: "Complete Markets 101 Lesson 1",
    icon: "trending-up-outline",
  },
  {
    id: "prob_master",
    title: "Probability Master",
    description: "Complete all probability lessons",
    icon: "dice-outline",
  },
  {
    id: "stat_wizard",
    title: "Statistics Wizard",
    description: "Complete all statistics lessons",
    icon: "stats-chart-outline",
  },
  {
    id: "beat_market",
    title: "Beat the Market",
    description: "Strategy outperforms buy-and-hold",
    icon: "trophy-outline",
  },
  {
    id: "sharp_thinker",
    title: "Sharp Thinker",
    description: "Achieve Sharpe ratio > 1.5",
    icon: "bulb-outline",
  },
  {
    id: "full_stack",
    title: "Full Stack Quant",
    description: "Complete all 10 modules",
    icon: "star-outline",
  },
  {
    id: "quiz_ace",
    title: "Quiz Ace",
    description: "Score 100% on 10 quizzes",
    icon: "ribbon-outline",
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "7-day learning streak",
    icon: "flame-outline",
  },
  {
    id: "streak_30",
    title: "Month Master",
    description: "30-day learning streak",
    icon: "diamond-outline",
  },
  {
    id: "strategy_5",
    title: "Strategy Architect",
    description: "Create 5 strategies",
    icon: "construct-outline",
  },
  {
    id: "microstructure",
    title: "Market Maker",
    description: "Complete market microstructure module",
    icon: "business-outline",
  },
  {
    id: "math_complete",
    title: "Math Genius",
    description: "Complete math for quants module",
    icon: "calculator-outline",
  },
  {
    id: "interview_ready",
    title: "Interview Ready",
    description: "Complete interview prep module",
    icon: "briefcase-outline",
  },
  {
    id: "ten_backtests",
    title: "Backtester",
    description: "Run 10 backtests",
    icon: "flash-outline",
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
