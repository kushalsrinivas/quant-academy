import { useCallback, useState } from "react";

import {
    runBacktest,
    type BacktestResult,
    type StrategyConfig,
} from "@/lib/engine/backtest";
import type { OHLCV } from "@/lib/engine/indicators";

export function useBacktest() {
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [running, setRunning] = useState(false);

  const execute = useCallback((bars: OHLCV[], strategy: StrategyConfig) => {
    setRunning(true);
    try {
      const r = runBacktest(bars, strategy);
      setResult(r);
      return r;
    } finally {
      setRunning(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return { result, running, execute, reset };
}
