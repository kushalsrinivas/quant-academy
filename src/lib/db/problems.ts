import type { SQLiteDatabase } from "expo-sqlite";

export async function markProblemSolved(
  db: SQLiteDatabase,
  problemId: string,
): Promise<boolean> {
  const existing = await db.getFirstAsync<{ solved: number }>(
    "SELECT solved FROM problem_attempts WHERE problem_id = ?",
    problemId,
  );
  await db.runAsync(
    `INSERT INTO problem_attempts (problem_id, solved, solved_at)
     VALUES (?, 1, datetime('now'))
     ON CONFLICT(problem_id) DO UPDATE SET solved = 1, solved_at = datetime('now')`,
    problemId,
  );
  return (existing?.solved ?? 0) !== 1;
}

export async function markSolutionViewed(
  db: SQLiteDatabase,
  problemId: string,
) {
  await db.runAsync(
    `INSERT INTO problem_attempts (problem_id, solution_viewed)
     VALUES (?, 1)
     ON CONFLICT(problem_id) DO UPDATE SET solution_viewed = 1`,
    problemId,
  );
}

export async function getSolvedProblemIds(
  db: SQLiteDatabase,
): Promise<Set<string>> {
  const rows = await db.getAllAsync<{ problem_id: string }>(
    "SELECT problem_id FROM problem_attempts WHERE solved = 1",
  );
  return new Set(rows.map((r) => r.problem_id));
}

export async function isProblemSolved(
  db: SQLiteDatabase,
  problemId: string,
): Promise<boolean> {
  const row = await db.getFirstAsync<{ solved: number }>(
    "SELECT solved FROM problem_attempts WHERE problem_id = ?",
    problemId,
  );
  return row?.solved === 1;
}
