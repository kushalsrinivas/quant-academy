import type { SQLiteDatabase } from "expo-sqlite";

export async function getWeeklyAttempt(
  db: SQLiteDatabase,
  weekId: string,
): Promise<{ solved_count: number; completed: number } | null> {
  try {
    return await db.getFirstAsync<{ solved_count: number; completed: number }>(
      "SELECT solved_count, completed FROM weekly_attempts WHERE week_id = ?",
      weekId,
    );
  } catch {
    return null;
  }
}

export async function recordWeeklyProgress(
  db: SQLiteDatabase,
  weekId: string,
  solvedCount: number,
  totalCount = 3,
): Promise<void> {
  const completed = solvedCount >= totalCount ? 1 : 0;
  await db.runAsync(
    `INSERT INTO weekly_attempts (week_id, solved_count, total_count, completed, completed_at)
     VALUES (?, ?, ?, ?, CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END)
     ON CONFLICT(week_id) DO UPDATE SET
       solved_count = excluded.solved_count,
       completed = excluded.completed,
       completed_at = CASE WHEN excluded.completed = 1 THEN datetime('now') ELSE completed_at END`,
    weekId,
    solvedCount,
    totalCount,
    completed,
    completed,
  );
}
