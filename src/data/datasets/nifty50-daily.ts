import type { OHLCV } from "@/lib/engine/indicators";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateSyntheticData(
  startDate: string,
  days: number,
  startPrice: number,
  volatility: number,
  drift: number,
  seed: number,
): OHLCV[] {
  const rand = seededRandom(seed);
  const data: OHLCV[] = [];
  let price = startPrice;
  const date = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const dailyReturn = drift + volatility * (rand() * 2 - 1);
    const open = price;
    const change = open * dailyReturn;
    const intraVol = Math.abs(change) * (1 + rand());

    const high = open + Math.abs(intraVol) * (0.5 + rand() * 0.5);
    const low = open - Math.abs(intraVol) * (0.5 + rand() * 0.5);
    const close = open + change;
    const volume = Math.round(1000000 + rand() * 5000000);

    price = Math.max(close, 1);

    data.push({
      date: date.toISOString().split("T")[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(Math.max(high, open, close) * 100) / 100,
      low: Math.round(Math.min(low, open, close) * 100) / 100,
      close: Math.round(price * 100) / 100,
      volume,
    });

    date.setDate(date.getDate() + 1);
    if (date.getDay() === 0) date.setDate(date.getDate() + 1);
    if (date.getDay() === 6) date.setDate(date.getDate() + 2);
  }

  return data;
}

export const NIFTY50_DAILY = generateSyntheticData(
  "2020-01-02",
  1000,
  12000,
  0.015,
  0.0003,
  12345,
);

export const STOCK_DATA: Record<string, OHLCV[]> = {
  RELIANCE: generateSyntheticData("2020-01-02", 500, 1500, 0.02, 0.0004, 11111),
  TCS: generateSyntheticData("2020-01-02", 500, 2200, 0.018, 0.0003, 22222),
  INFY: generateSyntheticData("2020-01-02", 500, 800, 0.022, 0.0005, 33333),
  HDFCBANK: generateSyntheticData(
    "2020-01-02",
    500,
    2500,
    0.016,
    0.0002,
    44444,
  ),
  ITC: generateSyntheticData("2020-01-02", 500, 210, 0.012, 0.0001, 55555),
};

export const STOCK_NAMES = Object.keys(STOCK_DATA);
