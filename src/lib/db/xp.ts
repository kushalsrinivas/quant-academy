import type { SQLiteDatabase } from "expo-sqlite";

export interface XPEntry {
  id: number;
  amount: number;
  source: string;
  source_id: string | null;
  earned_at: string;
}

export const LEVELS = [
  { level: 1, title: "Intern", xpRequired: 0 },
  { level: 2, title: "Junior Quant", xpRequired: 500 },
  { level: 3, title: "Researcher", xpRequired: 1500 },
  { level: 4, title: "Trader", xpRequired: 3500 },
  { level: 5, title: "Portfolio Manager", xpRequired: 7000 },
  { level: 6, title: "HFT Engineer", xpRequired: 12000 },
] as const;

export const XP_VALUES = {
  lesson: 50,
  quiz_perfect: 100,
  quiz_partial_min: 25,
  quiz_partial_max: 75,
  simulation: 75,
  backtest: 25,
  beat_market: 150,
  streak: 20,
} as const;

export function getLevelForXP(totalXP: number) {
  let current: (typeof LEVELS)[number] = LEVELS[0];
  for (const level of LEVELS) {
    if (totalXP >= level.xpRequired) {
      current = level;
    } else {
      break;
    }
  }
  const nextLevel = LEVELS.find((l) => l.level === current.level + 1);
  const xpForNext = nextLevel ? nextLevel.xpRequired - totalXP : 0;
  const progressToNext = nextLevel
    ? (totalXP - current.xpRequired) /
      (nextLevel.xpRequired - current.xpRequired)
    : 1;
  return { ...current, totalXP, xpForNext, progressToNext, nextLevel };
}

export async function addXP(
  db: SQLiteDatabase,
  amount: number,
  source: string,
  sourceId?: string,
) {
  await db.runAsync(
    "INSERT INTO xp_log (amount, source, source_id) VALUES (?, ?, ?)",
    amount,
    source,
    sourceId ?? null,
  );
}

export async function getTotalXP(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM xp_log",
  );
  return row?.total ?? 0;
}

export async function getXPHistory(db: SQLiteDatabase): Promise<XPEntry[]> {
  return db.getAllAsync<XPEntry>(
    "SELECT * FROM xp_log ORDER BY earned_at DESC LIMIT 50",
  );
}

export async function hasEarnedXPFor(
  db: SQLiteDatabase,
  source: string,
  sourceId: string,
): Promise<boolean> {
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM xp_log WHERE source = ? AND source_id = ?",
    source,
    sourceId,
  );
  return (row?.count ?? 0) > 0;
}
