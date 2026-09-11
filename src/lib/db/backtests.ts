import type { SQLiteDatabase } from "expo-sqlite";

import type {
  SharedBacktestResult,
  StoredBacktestConfig,
} from "@/lib/engine/shared-results";

const MAX_STORED_EQUITY_POINTS = 400;

function downsampleEquity(
  equity: Array<{ date: string; value: number }>,
): Array<{ date: string; value: number }> {
  if (equity.length <= MAX_STORED_EQUITY_POINTS) return equity;
  const step = equity.length / MAX_STORED_EQUITY_POINTS;
  const sampled: Array<{ date: string; value: number }> = [];
  for (let i = 0; i < MAX_STORED_EQUITY_POINTS; i++) {
    const point = equity[Math.floor(i * step)];
    if (point) sampled.push(point);
  }
  const last = equity[equity.length - 1];
  if (last && sampled[sampled.length - 1] !== last) sampled.push(last);
  return sampled;
}

export async function saveBacktestRun(
  db: SQLiteDatabase,
  run: {
    strategyName: string;
    symbol: string;
    config: StoredBacktestConfig;
    result: SharedBacktestResult;
  },
): Promise<number> {
  const { strategyName, symbol, config, result } = run;
  const summary = {
    totalReturn: result.totalReturn,
    annualizedReturn: result.annualizedReturn,
    sharpeRatio: result.sharpeRatio,
    maxDrawdown: result.maxDrawdown,
    winRate: result.winRate,
    totalTrades: result.totalTrades,
    profitFactor: result.profitFactor,
    buyHoldReturn: result.buyHoldReturn,
  };
  const r = await db.runAsync(
    `INSERT INTO backtest_runs (strategy_name, symbol, config, summary, trades, equity)
     VALUES (?, ?, ?, ?, ?, ?)`,
    strategyName,
    symbol,
    JSON.stringify(config),
    JSON.stringify(summary),
    JSON.stringify(result.trades),
    JSON.stringify(downsampleEquity(result.equityCurve)),
  );
  return r.lastInsertRowId;
}

export interface LoadedBacktestRun {
  id: number;
  strategyName: string;
  symbol: string;
  config: StoredBacktestConfig;
  result: SharedBacktestResult;
  createdAt: string;
}

export async function getBacktestRun(
  db: SQLiteDatabase,
  id: number,
): Promise<LoadedBacktestRun | null> {
  const row = await db.getFirstAsync<{
    id: number;
    strategy_name: string;
    symbol: string;
    config: string;
    summary: string;
    trades: string;
    equity: string;
    created_at: string;
  }>("SELECT * FROM backtest_runs WHERE id = ?", id);
  if (!row) return null;
  const summary = JSON.parse(row.summary);
  return {
    id: row.id,
    strategyName: row.strategy_name,
    symbol: row.symbol,
    config: JSON.parse(row.config) as StoredBacktestConfig,
    result: {
      ...summary,
      trades: JSON.parse(row.trades),
      equityCurve: JSON.parse(row.equity),
      strategyName: row.strategy_name,
      symbol: row.symbol,
    } as SharedBacktestResult,
    createdAt: row.created_at,
  };
}

export async function getBacktestCount(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM backtest_runs",
  );
  return row?.count ?? 0;
}
