import type { SQLiteDatabase } from "expo-sqlite";

export interface QuizAttempt {
  id: number;
  module_id: string;
  lesson_id: string;
  score: number;
  total: number;
  answers: number[] | null;
  taken_at: string;
}

export async function recordQuizResult(
  db: SQLiteDatabase,
  attempt: {
    moduleId: string;
    lessonId: string;
    score: number;
    total: number;
    answers: number[];
  },
) {
  await db.runAsync(
    `INSERT INTO quiz_results (module_id, lesson_id, score, total, answers)
     VALUES (?, ?, ?, ?, ?)`,
    attempt.moduleId,
    attempt.lessonId,
    attempt.score,
    attempt.total,
    JSON.stringify(attempt.answers),
  );
}

export async function getPerfectQuizCount(
  db: SQLiteDatabase,
): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(DISTINCT module_id || '/' || lesson_id) as count
     FROM quiz_results WHERE score = total AND total > 0`,
  );
  return row?.count ?? 0;
}

export async function getQuizHistory(
  db: SQLiteDatabase,
  moduleId: string,
  lessonId: string,
): Promise<QuizAttempt[]> {
  const rows = await db.getAllAsync<{
    id: number;
    module_id: string;
    lesson_id: string;
    score: number;
    total: number;
    answers: string | null;
    taken_at: string;
  }>(
    `SELECT * FROM quiz_results
     WHERE module_id = ? AND lesson_id = ?
     ORDER BY taken_at DESC LIMIT 20`,
    moduleId,
    lessonId,
  );
  return rows.map((r) => ({
    ...r,
    answers: r.answers ? (JSON.parse(r.answers) as number[]) : null,
  }));
}

export async function getModuleAccuracy(
  db: SQLiteDatabase,
  moduleId: string,
): Promise<{ answered: number; correct: number } | null> {
  const row = await db.getFirstAsync<{
    answered: number;
    correct: number;
  }>(
    `SELECT COALESCE(SUM(total), 0) as answered, COALESCE(SUM(score), 0) as correct
     FROM quiz_results WHERE module_id = ?`,
    moduleId,
  );
  if (!row || row.answered === 0) return null;
  return { answered: row.answered, correct: row.correct };
}
