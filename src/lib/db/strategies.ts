import type { SQLiteDatabase } from "expo-sqlite";

export interface StrategyRow {
  id: number;
  name: string;
  conditions: string;
  results: string | null;
  created_at: string;
  updated_at: string | null;
}

export async function saveStrategy(
  db: SQLiteDatabase,
  name: string,
  conditions: object,
  results?: object,
) {
  const r = await db.runAsync(
    `INSERT INTO strategies (name, conditions, results) VALUES (?, ?, ?)`,
    name,
    JSON.stringify(conditions),
    results ? JSON.stringify(results) : null,
  );
  return r.lastInsertRowId;
}

export async function updateStrategyResults(
  db: SQLiteDatabase,
  id: number,
  results: object,
) {
  await db.runAsync(
    `UPDATE strategies SET results = ?, updated_at = datetime('now') WHERE id = ?`,
    JSON.stringify(results),
    id,
  );
}

export async function getAllStrategies(
  db: SQLiteDatabase,
): Promise<StrategyRow[]> {
  return db.getAllAsync<StrategyRow>(
    "SELECT * FROM strategies ORDER BY created_at DESC",
  );
}

export async function deleteStrategy(db: SQLiteDatabase, id: number) {
  await db.runAsync("DELETE FROM strategies WHERE id = ?", id);
}

export async function getStrategyCount(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM strategies",
  );
  return row?.count ?? 0;
}
