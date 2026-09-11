import type { SQLiteDatabase } from "expo-sqlite";

import { getLessonsForModule } from "@/lib/content/loader";
import { MODULES } from "@/lib/content/modules";

export interface WeakModule {
  moduleId: string;
  title: string;
  color: string;
  answered: number;
  correct: number;
  accuracy: number;
  failedLessons: { lessonId: string; title: string }[];
}

export async function getWeakTopics(
  db: SQLiteDatabase,
  limit = 3,
): Promise<WeakModule[]> {
  const rows = await db.getAllAsync<{
    module_id: string;
    answered: number;
    correct: number;
  }>(
    `SELECT module_id, COALESCE(SUM(total),0) as answered, COALESCE(SUM(score),0) as correct
     FROM quiz_results GROUP BY module_id`,
  );
  const byModule = new Map(rows.map((r) => [r.module_id, r]));
  const out: WeakModule[] = [];
  for (const mod of MODULES) {
    const r = byModule.get(mod.id);
    if (!r || r.answered === 0) continue;
    const accuracy = r.correct / Math.max(1, r.answered);
    if (accuracy >= 0.7 && r.answered >= 5) continue;
    const attempts = await db.getAllAsync<{
      lesson_id: string;
      score: number;
      total: number;
    }>(
      `SELECT lesson_id, score, total FROM quiz_results WHERE module_id = ? ORDER BY taken_at DESC LIMIT 50`,
      mod.id,
    );
    const worst = new Map<string, { score: number; total: number }>();
    for (const a of attempts) {
      if (!worst.has(a.lesson_id)) worst.set(a.lesson_id, a);
    }
    const lessons = getLessonsForModule(mod.id);
    const failedLessons = [...worst.entries()]
      .filter(([, v]) => v.score < v.total)
      .slice(0, 5)
      .map(([lessonId]) => ({
        lessonId,
        title: lessons.find((l) => l.id === lessonId)?.title ?? lessonId,
      }));
    out.push({
      moduleId: mod.id,
      title: mod.title,
      color: mod.color,
      answered: r.answered,
      correct: r.correct,
      accuracy,
      failedLessons,
    });
  }
  return out
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit);
}
