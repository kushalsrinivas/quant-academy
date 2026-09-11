import type { SQLiteDatabase } from "expo-sqlite";

const DATABASE_VERSION = 5;

export async function migrateDb(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  let currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';

      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        completed_at TEXT,
        UNIQUE(module_id, lesson_id)
      );

      CREATE TABLE IF NOT EXISTS xp_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount INTEGER NOT NULL,
        source TEXT NOT NULL,
        source_id TEXT,
        earned_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS quiz_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        answers TEXT,
        taken_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        achievement_id TEXT UNIQUE NOT NULL,
        unlocked_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS strategies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        conditions TEXT NOT NULL,
        results TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
    currentVersion = 1;
  }

  if (currentVersion === 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS activity_days (
        day TEXT PRIMARY KEY,
        lessons INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0,
        goal_met INTEGER DEFAULT 0
      );
    `);
    currentVersion = 2;
  }

  if (currentVersion === 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS backtest_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        strategy_name TEXT NOT NULL,
        symbol TEXT NOT NULL,
        config TEXT NOT NULL,
        summary TEXT NOT NULL,
        trades TEXT NOT NULL,
        equity TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);
    currentVersion = 3;
  }

  if (currentVersion === 3) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS problem_attempts (
        problem_id TEXT PRIMARY KEY,
        solved INTEGER DEFAULT 0,
        solution_viewed INTEGER DEFAULT 0,
        solved_at TEXT
      );
    `);
    currentVersion = 4;
  }

  if (currentVersion === 4) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS weekly_attempts (
        week_id TEXT PRIMARY KEY,
        solved_count INTEGER DEFAULT 0,
        total_count INTEGER DEFAULT 3,
        completed INTEGER DEFAULT 0,
        completed_at TEXT
      );
    `);
    currentVersion = 5;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
