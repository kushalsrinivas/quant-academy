import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import { MODULES } from "@/lib/content/modules";
import { getAllProgress, type ProgressRow } from "@/lib/db/progress";

export function useProgress() {
  const db = useSQLiteContext();
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const rows = await getAllProgress(db);
    setProgress(rows);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    reload();
  }, [reload]);

  const completedByModule = progress.reduce(
    (acc, row) => {
      acc[row.module_id] = (acc[row.module_id] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalCompleted = progress.length;
  const totalLessons = MODULES.reduce((s, m) => s + m.lessonCount, 0);
  const overallProgress = totalLessons > 0 ? totalCompleted / totalLessons : 0;

  return {
    progress,
    completedByModule,
    totalCompleted,
    totalLessons,
    overallProgress,
    loading,
    reload,
  };
}
