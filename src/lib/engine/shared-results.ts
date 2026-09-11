export interface StoredBacktestConfig {
  buyConditions: Array<{
    indicator: string;
    period: string;
    operator: string;
    value: string;
  }>;
  sellConditions: Array<{
    indicator: string;
    period: string;
    operator: string;
    value: string;
  }>;
  initialCapital: number;
  positionSizePct: number;
  slippageBps: number;
  commission: number;
}

export interface SharedBacktestResult {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number | null;
  buyHoldReturn: number;
  trades: Array<{
    entryDate: string;
    exitDate: string;
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    pnl: number;
    returnPct: number;
  }>;
  equityCurve: Array<{ date: string; value: number }>;
  strategyName: string;
  symbol: string;
}

let _lastResult: SharedBacktestResult | null = null;

export function setLastResult(result: SharedBacktestResult) {
  _lastResult = result;
}

export function getLastResult(): SharedBacktestResult | null {
  return _lastResult;
}
