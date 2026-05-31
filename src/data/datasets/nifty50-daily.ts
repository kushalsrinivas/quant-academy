import type { OHLCV } from "@/lib/engine/indicators";

function generateSyntheticData(
  startDate: string,
  days: number,
  startPrice: number,
  volatility: number,
  drift: number,
): OHLCV[] {
  const data: OHLCV[] = [];
  let price = startPrice;
  const date = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const dailyReturn = drift + volatility * (Math.random() * 2 - 1);
    const open = price;
    const change = open * dailyReturn;
    const intraVol = Math.abs(change) * (1 + Math.random());

    const high = open + Math.abs(intraVol) * (0.5 + Math.random() * 0.5);
    const low = open - Math.abs(intraVol) * (0.5 + Math.random() * 0.5);
    const close = open + change;
    const volume = Math.round(1000000 + Math.random() * 5000000);

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
);

export const STOCK_DATA: Record<string, OHLCV[]> = {
  RELIANCE: generateSyntheticData("2020-01-02", 500, 1500, 0.02, 0.0004),
  TCS: generateSyntheticData("2020-01-02", 500, 2200, 0.018, 0.0003),
  INFY: generateSyntheticData("2020-01-02", 500, 800, 0.022, 0.0005),
  HDFC: generateSyntheticData("2020-01-02", 500, 2500, 0.016, 0.0002),
  ITC: generateSyntheticData("2020-01-02", 500, 210, 0.012, 0.0001),
};

export const STOCK_NAMES = Object.keys(STOCK_DATA);
