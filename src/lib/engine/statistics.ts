export function mean(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((s, v) => s + v, 0) / data.length;
}

export function median(data: number[]): number {
  if (data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function mode(data: number[]): number {
  const counts = new Map<number, number>();
  let maxCount = 0;
  let result = data[0] ?? 0;
  for (const v of data) {
    const c = (counts.get(v) ?? 0) + 1;
    counts.set(v, c);
    if (c > maxCount) {
      maxCount = c;
      result = v;
    }
  }
  return result;
}

export function variance(data: number[]): number {
  if (data.length < 2) return 0;
  const m = mean(data);
  return data.reduce((s, v) => s + (v - m) ** 2, 0) / (data.length - 1);
}

export function standardDeviation(data: number[]): number {
  return Math.sqrt(variance(data));
}

export function covariance(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  const mx = mean(x.slice(0, n));
  const my = mean(y.slice(0, n));
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += (x[i] - mx) * (y[i] - my);
  }
  return sum / (n - 1);
}

export function correlation(x: number[], y: number[]): number {
  const cov = covariance(x, y);
  const sx = standardDeviation(x);
  const sy = standardDeviation(y);
  if (sx === 0 || sy === 0) return 0;
  return cov / (sx * sy);
}

export function linearRegression(
  x: number[],
  y: number[],
): { slope: number; intercept: number; r2: number } {
  const n = Math.min(x.length, y.length);
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

  const mx = mean(x.slice(0, n));
  const my = mean(y.slice(0, n));

  let ssxy = 0;
  let ssxx = 0;
  for (let i = 0; i < n; i++) {
    ssxy += (x[i] - mx) * (y[i] - my);
    ssxx += (x[i] - mx) ** 2;
  }

  const slope = ssxx === 0 ? 0 : ssxy / ssxx;
  const intercept = my - slope * mx;

  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    ssTot += (y[i] - my) ** 2;
    const predicted = slope * x[i] + intercept;
    ssRes += (y[i] - predicted) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}

export function percentile(data: number[], p: number): number {
  if (data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

export function returns(prices: number[]): number[] {
  const r: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    r.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  return r;
}

export function rollingMean(data: number[], window: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (let j = i - window + 1; j <= i; j++) sum += data[j];
    result.push(sum / window);
  }
  return result;
}

export function rollingStd(data: number[], window: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(null);
      continue;
    }
    const slice = data.slice(i - window + 1, i + 1);
    result.push(standardDeviation(slice));
  }
  return result;
}

export function normalPDF(
  x: number,
  mu: number = 0,
  sigma: number = 1,
): number {
  const coefficient = 1 / (sigma * Math.sqrt(2 * Math.PI));
  const exponent = -((x - mu) ** 2) / (2 * sigma ** 2);
  return coefficient * Math.exp(exponent);
}

export function normalCDF(
  x: number,
  mu: number = 0,
  sigma: number = 1,
): number {
  const z = (x - mu) / sigma;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export function zScore(value: number, data: number[]): number {
  const m = mean(data);
  const s = standardDeviation(data);
  if (s === 0) return 0;
  return (value - m) / s;
}

export function generateHistogram(
  data: number[],
  bins: number,
): { binStart: number; binEnd: number; count: number }[] {
  if (data.length === 0) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins || 1;

  const result = Array.from({ length: bins }, (_, i) => ({
    binStart: min + i * binWidth,
    binEnd: min + (i + 1) * binWidth,
    count: 0,
  }));

  for (const v of data) {
    let idx = Math.floor((v - min) / binWidth);
    if (idx >= bins) idx = bins - 1;
    if (idx < 0) idx = 0;
    result[idx].count++;
  }

  return result;
}
