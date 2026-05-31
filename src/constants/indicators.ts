export interface IndicatorDef {
  id: string;
  name: string;
  shortName: string;
  description: string;
  params: IndicatorParam[];
  category: "trend" | "momentum" | "volatility" | "volume";
}

export interface IndicatorParam {
  name: string;
  label: string;
  default: number;
  min: number;
  max: number;
}

export const INDICATORS: IndicatorDef[] = [
  {
    id: "sma",
    name: "Simple Moving Average",
    shortName: "SMA",
    description: "Average price over a window of N periods",
    category: "trend",
    params: [
      { name: "period", label: "Period", default: 20, min: 2, max: 200 },
    ],
  },
  {
    id: "ema",
    name: "Exponential Moving Average",
    shortName: "EMA",
    description: "Weighted moving average giving more weight to recent prices",
    category: "trend",
    params: [
      { name: "period", label: "Period", default: 20, min: 2, max: 200 },
    ],
  },
  {
    id: "rsi",
    name: "Relative Strength Index",
    shortName: "RSI",
    description:
      "Momentum oscillator measuring speed and change of price movements",
    category: "momentum",
    params: [
      { name: "period", label: "Period", default: 14, min: 2, max: 100 },
    ],
  },
  {
    id: "macd",
    name: "MACD",
    shortName: "MACD",
    description:
      "Moving Average Convergence Divergence - trend-following momentum indicator",
    category: "momentum",
    params: [
      { name: "fast", label: "Fast EMA", default: 12, min: 2, max: 50 },
      { name: "slow", label: "Slow EMA", default: 26, min: 5, max: 100 },
      { name: "signal", label: "Signal", default: 9, min: 2, max: 50 },
    ],
  },
  {
    id: "bollinger",
    name: "Bollinger Bands",
    shortName: "BB",
    description: "Volatility bands placed above and below a moving average",
    category: "volatility",
    params: [
      { name: "period", label: "Period", default: 20, min: 5, max: 100 },
      { name: "stdDev", label: "Std Dev", default: 2, min: 1, max: 4 },
    ],
  },
  {
    id: "momentum",
    name: "Momentum",
    shortName: "MOM",
    description: "Rate of change of price over N periods",
    category: "momentum",
    params: [
      { name: "period", label: "Period", default: 10, min: 1, max: 100 },
    ],
  },
  {
    id: "atr",
    name: "Average True Range",
    shortName: "ATR",
    description: "Measure of volatility based on true range",
    category: "volatility",
    params: [
      { name: "period", label: "Period", default: 14, min: 2, max: 100 },
    ],
  },
  {
    id: "volume_sma",
    name: "Volume SMA",
    shortName: "VSMA",
    description: "Simple moving average of volume",
    category: "volume",
    params: [
      { name: "period", label: "Period", default: 20, min: 2, max: 100 },
    ],
  },
];
