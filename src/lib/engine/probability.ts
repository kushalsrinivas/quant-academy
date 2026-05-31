export function coinToss(
  n: number,
  bias: number = 0.5,
): { heads: number; tails: number; results: boolean[] } {
  const results: boolean[] = [];
  let heads = 0;
  let tails = 0;

  for (let i = 0; i < n; i++) {
    const isHeads = Math.random() < bias;
    results.push(isHeads);
    if (isHeads) heads++;
    else tails++;
  }

  return { heads, tails, results };
}

export function diceRoll(
  n: number,
  sides: number = 6,
): { counts: Record<number, number>; results: number[] } {
  const results: number[] = [];
  const counts: Record<number, number> = {};

  for (let i = 1; i <= sides; i++) counts[i] = 0;

  for (let i = 0; i < n; i++) {
    const value = Math.floor(Math.random() * sides) + 1;
    results.push(value);
    counts[value] = (counts[value] ?? 0) + 1;
  }

  return { counts, results };
}

export function expectedValue(
  outcomes: { value: number; probability: number }[],
): number {
  return outcomes.reduce((sum, o) => sum + o.value * o.probability, 0);
}

export function varianceFromOutcomes(
  outcomes: { value: number; probability: number }[],
): number {
  const ev = expectedValue(outcomes);
  return outcomes.reduce(
    (sum, o) => sum + o.probability * (o.value - ev) ** 2,
    0,
  );
}

export function monteCarloSimulation(
  trials: number,
  simulate: () => number,
): {
  mean: number;
  std: number;
  results: number[];
  histogram: { bin: number; count: number }[];
} {
  const results: number[] = [];
  for (let i = 0; i < trials; i++) {
    results.push(simulate());
  }

  const mean = results.reduce((s, v) => s + v, 0) / results.length;
  const variance =
    results.reduce((s, v) => s + (v - mean) ** 2, 0) / results.length;
  const std = Math.sqrt(variance);

  const min = Math.min(...results);
  const max = Math.max(...results);
  const binCount = Math.min(50, Math.ceil(Math.sqrt(results.length)));
  const binWidth = (max - min) / binCount || 1;

  const histogram: { bin: number; count: number }[] = [];
  for (let i = 0; i < binCount; i++) {
    histogram.push({ bin: min + (i + 0.5) * binWidth, count: 0 });
  }
  for (const v of results) {
    let idx = Math.floor((v - min) / binWidth);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    histogram[idx].count++;
  }

  return { mean, std, results, histogram };
}

export function bayesianUpdate(
  prior: number,
  likelihood: number,
  evidence: number,
): number {
  if (evidence === 0) return 0;
  return (likelihood * prior) / evidence;
}

export function binomialProbability(n: number, k: number, p: number): number {
  let coeff = 1;
  for (let i = 0; i < k; i++) {
    coeff *= (n - i) / (i + 1);
  }
  return coeff * p ** k * (1 - p) ** (n - k);
}

export function normalRandom(mean: number = 0, std: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + std * z;
}

export function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export function combinations(n: number, k: number): number {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  return factorial(n) / (factorial(k) * factorial(n - k));
}
