import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import { addXP as dbAddXP, getLevelForXP, getTotalXP } from "@/lib/db/xp";

export function useXP() {
  const db = useSQLiteContext();
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const xp = await getTotalXP(db);
    setTotalXP(xp);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    reload();
  }, [reload]);

  const level = getLevelForXP(totalXP);

  const grantXP = useCallback(
    async (amount: number, source: string, sourceId?: string) => {
      await dbAddXP(db, amount, source, sourceId);
      await reload();
    },
    [db, reload],
  );

  return { totalXP, level, loading, reload, grantXP };
}
