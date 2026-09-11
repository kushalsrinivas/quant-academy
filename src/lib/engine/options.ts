function normCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p =
    d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

function normPDF(x: number): number {
  return Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI);
}

export type OptionType = "call" | "put";

export interface OptionInputs {
  spot: number;
  strike: number;
  timeYears: number;
  rate: number;
  vol: number;
  type: OptionType;
}

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export function blackScholesPrice(inputs: OptionInputs): number {
  const { spot: S, strike: K, timeYears: T, rate: r, vol, type } = inputs;
  if (S <= 0 || K <= 0 || T <= 0 || vol <= 0) return Math.max(type === "call" ? S - K : K - S, 0);
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + (vol * vol) / 2) * T) / (vol * sqrtT);
  const d2 = d1 - vol * sqrtT;
  if (type === "call") {
    return S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
  }
  return K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
}

export function blackScholesGreeks(inputs: OptionInputs): Greeks {
  const { spot: S, strike: K, timeYears: T, rate: r, vol, type } = inputs;
  if (S <= 0 || K <= 0 || T <= 0 || vol <= 0) {
    return { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  }
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + (vol * vol) / 2) * T) / (vol * sqrtT);
  const d2 = d1 - vol * sqrtT;
  const gamma = normPDF(d1) / (S * vol * sqrtT);
  const vega = (S * normPDF(d1) * sqrtT) / 100;
  if (type === "call") {
    const delta = normCDF(d1);
    const theta =
      (-(S * normPDF(d1) * vol) / (2 * sqrtT) -
        r * K * Math.exp(-r * T) * normCDF(d2)) /
      365;
    const rho = (K * T * Math.exp(-r * T) * normCDF(d2)) / 100;
    return { delta, gamma, theta, vega, rho };
  }
  const delta = normCDF(d1) - 1;
  const theta =
    (-(S * normPDF(d1) * vol) / (2 * sqrtT) +
      r * K * Math.exp(-r * T) * normCDF(-d2)) /
    365;
  const rho = (-K * T * Math.exp(-r * T) * normCDF(-d2)) / 100;
  return { delta, gamma, theta, vega, rho };
}

export function impliedVolatility(
  marketPrice: number,
  inputs: Omit<OptionInputs, "vol">,
  guess = 0.3,
): number {
  let vol = guess;
  for (let i = 0; i < 50; i++) {
    const price = blackScholesPrice({ ...inputs, vol });
    const vegaFull =
      blackScholesGreeks({ ...inputs, vol }).vega * 100;
    const diff = price - marketPrice;
    if (Math.abs(diff) < 1e-4) break;
    if (vegaFull <= 1e-8) break;
    vol = Math.min(5, Math.max(0.01, vol - diff / vegaFull));
  }
  return vol;
}

export function payoffAtExpiry(
  type: OptionType,
  strike: number,
  premium: number,
  spotAtExpiry: number,
  position: 1 | -1 = 1,
): number {
  const intrinsic =
    type === "call"
      ? Math.max(spotAtExpiry - strike, 0)
      : Math.max(strike - spotAtExpiry, 0);
  return position * (intrinsic - premium);
}

export function payoffSeries(
  type: OptionType,
  strike: number,
  premium: number,
  spots: number[],
): number[] {
  return spots.map((s) => payoffAtExpiry(type, strike, premium, s));
}
