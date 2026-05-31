import {
    bollingerBands,
    ema,
    macd,
    momentum,
    type OHLCV,
    rsi,
    sma,
} from "./indicators";
import {
    returns as computeReturns,
    mean,
    standardDeviation,
} from "./statistics";

export type ComparisonOp =
  | ">"
  | "<"
  | ">="
  | "<="
  | "=="
  | "crosses_above"
  | "crosses_below";

export interface Condition {
  indicator: string;
  params: Record<string, number>;
  operator: ComparisonOp;
  value: number | string;
}

export interface StrategyConfig {
  buyConditions: Condition[];
  sellConditions: Condition[];
  initialCapital: number;
  positionSize: number;
  slippage: number;
  commission: number;
}

export interface TradeRecord {
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  returnPct: number;
}

export interface BacktestResult {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  trades: TradeRecord[];
  equityCurve: { date: string; value: number }[];
  buyHoldReturn: number;
}

function computeIndicator(
  closes: number[],
  bars: OHLCV[],
  indicator: string,
  params: Record<string, number>,
): (number | null)[] {
  switch (indicator) {
    case "price":
      return closes.map((c) => c);
    case "sma":
      return sma(closes, params.period ?? 20);
    case "ema":
      return ema(closes, params.period ?? 20);
    case "rsi":
      return rsi(closes, params.period ?? 14);
    case "momentum":
      return momentum(closes, params.period ?? 10);
    case "macd":
      return macd(
        closes,
        params.fast ?? 12,
        params.slow ?? 26,
        params.signal ?? 9,
      ).macd;
    case "macd_signal":
      return macd(
        closes,
        params.fast ?? 12,
        params.slow ?? 26,
        params.signal ?? 9,
      ).signal;
    case "bollinger_upper":
      return bollingerBands(closes, params.period ?? 20, params.stdDev ?? 2)
        .upper;
    case "bollinger_lower":
      return bollingerBands(closes, params.period ?? 20, params.stdDev ?? 2)
        .lower;
    default:
      return closes.map(() => null);
  }
}

function resolveValue(
  valueSpec: number | string,
  closes: number[],
  bars: OHLCV[],
  idx: number,
): number | null {
  if (typeof valueSpec === "number") return valueSpec;

  const parts = valueSpec.split("_");
  if (parts.length >= 2) {
    const indicator = parts[0];
    const period = parseInt(parts[1], 10);
    if (!isNaN(period)) {
      const vals = computeIndicator(closes, bars, indicator, { period });
      return vals[idx] ?? null;
    }
  }
  return parseFloat(valueSpec) || null;
}

function checkCondition(
  indicatorValues: (number | null)[],
  idx: number,
  operator: ComparisonOp,
  targetValue: number | null,
): boolean {
  const current = indicatorValues[idx];
  if (current === null || targetValue === null) return false;

  switch (operator) {
    case ">":
      return current > targetValue;
    case "<":
      return current < targetValue;
    case ">=":
      return current >= targetValue;
    case "<=":
      return current <= targetValue;
    case "==":
      return Math.abs(current - targetValue) < 0.0001;
    case "crosses_above": {
      if (idx === 0) return false;
      const prev = indicatorValues[idx - 1];
      return prev !== null && prev <= targetValue && current > targetValue;
    }
    case "crosses_below": {
      if (idx === 0) return false;
      const prev = indicatorValues[idx - 1];
      return prev !== null && prev >= targetValue && current < targetValue;
    }
    default:
      return false;
  }
}

export function runBacktest(
  bars: OHLCV[],
  strategy: StrategyConfig,
): BacktestResult {
  const closes = bars.map((b) => b.close);
  const n = bars.length;

  const buyIndicators = strategy.buyConditions.map((c) =>
    computeIndicator(closes, bars, c.indicator, c.params),
  );
  const sellIndicators = strategy.sellConditions.map((c) =>
    computeIndicator(closes, bars, c.indicator, c.params),
  );

  let cash = strategy.initialCapital;
  let shares = 0;
  let entryPrice = 0;
  let entryDate = "";
  const trades: TradeRecord[] = [];
  const equityCurve: { date: string; value: number }[] = [];

  for (let i = 0; i < n; i++) {
    const price = closes[i];
    const equity = cash + shares * price;
    equityCurve.push({ date: bars[i].date, value: equity });

    if (shares === 0) {
      const allBuyMet = strategy.buyConditions.every((c, ci) => {
        const target = resolveValue(c.value, closes, bars, i);
        return checkCondition(buyIndicators[ci], i, c.operator, target);
      });

      if (allBuyMet && strategy.buyConditions.length > 0) {
        const slippageMultiplier = 1 + strategy.slippage / 10000;
        const execPrice = price * slippageMultiplier;
        const availableCash =
          cash * strategy.positionSize - strategy.commission;
        if (availableCash > 0) {
          shares = Math.floor(availableCash / execPrice);
          if (shares > 0) {
            entryPrice = execPrice;
            entryDate = bars[i].date;
            cash -= shares * execPrice + strategy.commission;
          }
        }
      }
    } else {
      const allSellMet = strategy.sellConditions.every((c, ci) => {
        const target = resolveValue(c.value, closes, bars, i);
        return checkCondition(sellIndicators[ci], i, c.operator, target);
      });

      if (allSellMet && strategy.sellConditions.length > 0) {
        const slippageMultiplier = 1 - strategy.slippage / 10000;
        const execPrice = price * slippageMultiplier;
        const pnl = (execPrice - entryPrice) * shares - strategy.commission;
        const returnPct = (execPrice - entryPrice) / entryPrice;

        trades.push({
          entryDate,
          exitDate: bars[i].date,
          entryPrice: Math.round(entryPrice * 100) / 100,
          exitPrice: Math.round(execPrice * 100) / 100,
          quantity: shares,
          pnl: Math.round(pnl * 100) / 100,
          returnPct: Math.round(returnPct * 10000) / 10000,
        });

        cash += shares * execPrice - strategy.commission;
        shares = 0;
      }
    }
  }

  // Close any open position at end
  if (shares > 0) {
    const finalPrice = closes[n - 1];
    const pnl = (finalPrice - entryPrice) * shares;
    trades.push({
      entryDate,
      exitDate: bars[n - 1].date,
      entryPrice: Math.round(entryPrice * 100) / 100,
      exitPrice: Math.round(finalPrice * 100) / 100,
      quantity: shares,
      pnl: Math.round(pnl * 100) / 100,
      returnPct:
        Math.round(((finalPrice - entryPrice) / entryPrice) * 10000) / 10000,
    });
    cash += shares * finalPrice;
  }

  const finalEquity =
    equityCurve[equityCurve.length - 1]?.value ?? strategy.initialCapital;
  const totalReturn =
    (finalEquity - strategy.initialCapital) / strategy.initialCapital;

  const years = n / 252;
  const annualizedReturn =
    years > 0 ? Math.pow(1 + totalReturn, 1 / years) - 1 : totalReturn;

  const dailyReturns = computeReturns(equityCurve.map((e) => e.value));
  const avgDailyReturn = mean(dailyReturns);
  const dailyStd = standardDeviation(dailyReturns);
  const sharpeRatio =
    dailyStd > 0 ? (avgDailyReturn / dailyStd) * Math.sqrt(252) : 0;

  let maxDrawdown = 0;
  let peak = 0;
  for (const point of equityCurve) {
    if (point.value > peak) peak = point.value;
    const drawdown = (peak - point.value) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  const winningTrades = trades.filter((t) => t.pnl > 0);
  const losingTrades = trades.filter((t) => t.pnl <= 0);
  const winRate = trades.length > 0 ? winningTrades.length / trades.length : 0;

  const grossProfit = winningTrades.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0));
  const profitFactor =
    grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  const buyHoldReturn = (closes[n - 1] - closes[0]) / closes[0];

  return {
    totalReturn: Math.round(totalReturn * 10000) / 10000,
    annualizedReturn: Math.round(annualizedReturn * 10000) / 10000,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 10000) / 10000,
    winRate: Math.round(winRate * 10000) / 10000,
    totalTrades: trades.length,
    profitFactor: Math.round(profitFactor * 100) / 100,
    trades,
    equityCurve,
    buyHoldReturn: Math.round(buyHoldReturn * 10000) / 10000,
  };
}
