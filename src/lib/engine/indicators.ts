export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function sma(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j];
    }
    result.push(sum / period);
  }
  return result;
}

export function ema(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[j];
      result.push(sum / period);
      continue;
    }
    const prev = result[i - 1];
    if (prev === null) {
      result.push(null);
      continue;
    }
    result.push((data[i] - prev) * multiplier + prev);
  }
  return result;
}

export function rsi(data: number[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(null);
      continue;
    }

    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);

    if (i < period) {
      result.push(null);
      continue;
    }

    if (i === period) {
      let avgGain = 0;
      let avgLoss = 0;
      for (let j = 0; j < period; j++) {
        avgGain += gains[j];
        avgLoss += losses[j];
      }
      avgGain /= period;
      avgLoss /= period;
      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        result.push(100 - 100 / (1 + rs));
      }
      continue;
    }

    const prevRSI = result[i - 1];
    if (prevRSI === null) {
      result.push(null);
      continue;
    }

    const currentGain = gains[gains.length - 1];
    const currentLoss = losses[losses.length - 1];

    const prevAvgGain =
      prevRSI === 100
        ? currentGain
        : (currentGain +
            (100 / (100 - prevRSI) - 1) * (period - 1) * currentGain) /
          period;

    let avgGain = 0;
    let avgLoss = 0;
    const start = gains.length - period;
    for (let j = start; j < gains.length; j++) {
      avgGain += gains[j];
      avgLoss += losses[j];
    }
    avgGain /= period;
    avgLoss /= period;

    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }
  return result;
}

export function macd(
  data: number[],
  fast: number = 12,
  slow: number = 26,
  signalPeriod: number = 9,
): {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
} {
  const fastEMA = ema(data, fast);
  const slowEMA = ema(data, slow);

  const macdLine: (number | null)[] = fastEMA.map((f, i) => {
    const s = slowEMA[i];
    if (f === null || s === null) return null;
    return f - s;
  });

  const macdValues = macdLine.filter((v): v is number => v !== null);
  const signalLine = ema(macdValues, signalPeriod);

  const signal: (number | null)[] = [];
  const histogram: (number | null)[] = [];
  let macdIdx = 0;

  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null) {
      signal.push(null);
      histogram.push(null);
    } else {
      const sig = signalLine[macdIdx] ?? null;
      signal.push(sig);
      histogram.push(sig !== null ? macdLine[i]! - sig : null);
      macdIdx++;
    }
  }

  return { macd: macdLine, signal, histogram };
}

export function bollingerBands(
  data: number[],
  period: number = 20,
  stdDevMultiplier: number = 2,
): {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
} {
  const middle = sma(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    const mid = middle[i];
    if (mid === null || i < period - 1) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sumSq += (data[j] - mid) ** 2;
    }
    const std = Math.sqrt(sumSq / period);
    upper.push(mid + stdDevMultiplier * std);
    lower.push(mid - stdDevMultiplier * std);
  }

  return { upper, middle, lower };
}

export function momentum(
  data: number[],
  period: number = 10,
): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(null);
    } else {
      result.push(data[i] - data[i - period]);
    }
  }
  return result;
}

export function atr(bars: OHLCV[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  const trueRanges: number[] = [];

  for (let i = 0; i < bars.length; i++) {
    if (i === 0) {
      trueRanges.push(bars[i].high - bars[i].low);
      result.push(null);
      continue;
    }

    const tr = Math.max(
      bars[i].high - bars[i].low,
      Math.abs(bars[i].high - bars[i - 1].close),
      Math.abs(bars[i].low - bars[i - 1].close),
    );
    trueRanges.push(tr);

    if (i < period) {
      result.push(null);
      continue;
    }

    if (i === period) {
      let sum = 0;
      for (let j = 0; j <= period; j++) sum += trueRanges[j];
      result.push(sum / (period + 1));
      continue;
    }

    const prev = result[i - 1];
    if (prev === null) {
      result.push(null);
      continue;
    }
    result.push((prev * (period - 1) + tr) / period);
  }
  return result;
}

export function volumeSMA(
  bars: OHLCV[],
  period: number = 20,
): (number | null)[] {
  return sma(
    bars.map((b) => b.volume),
    period,
  );
}
