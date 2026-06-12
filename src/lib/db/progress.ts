import type { SQLiteDatabase } from "expo-sqlite";

import { getAllLessonCount } from "@/lib/content/loader";

export interface ProgressRow {
  id: number;
  module_id: string;
  lesson_id: string;
  completed: number;
  completed_at: string | null;
}

export async function markLessonComplete(
  db: SQLiteDatabase,
  moduleId: string,
  lessonId: string,
) {
  await db.runAsync(
    `INSERT INTO user_progress (module_id, lesson_id, completed, completed_at)
     VALUES (?, ?, 1, datetime('now'))
     ON CONFLICT(module_id, lesson_id) DO UPDATE SET completed = 1, completed_at = datetime('now')`,
    moduleId,
    lessonId,
  );
}

export async function isLessonComplete(
  db: SQLiteDatabase,
  moduleId: string,
  lessonId: string,
): Promise<boolean> {
  const row = await db.getFirstAsync<{ completed: number }>(
    "SELECT completed FROM user_progress WHERE module_id = ? AND lesson_id = ?",
    moduleId,
    lessonId,
  );
  return row?.completed === 1;
}

export async function getModuleProgress(
  db: SQLiteDatabase,
  moduleId: string,
): Promise<{ completed: number; total: number }> {
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM user_progress WHERE module_id = ? AND completed = 1",
    moduleId,
  );
  return { completed: row?.count ?? 0, total: getAllLessonCount(moduleId) };
}

export async function getCompletedLessons(
  db: SQLiteDatabase,
  moduleId: string,
): Promise<string[]> {
  const rows = await db.getAllAsync<{ lesson_id: string }>(
    "SELECT lesson_id FROM user_progress WHERE module_id = ? AND completed = 1",
    moduleId,
  );
  return rows.map((r) => r.lesson_id);
}

export async function getAllProgress(
  db: SQLiteDatabase,
): Promise<ProgressRow[]> {
  return db.getAllAsync<ProgressRow>(
    "SELECT * FROM user_progress WHERE completed = 1",
  );
}
