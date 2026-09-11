import type { SQLiteDatabase } from "expo-sqlite";

export type MarketLocale = "IN" | "US";

export const LOCALES: Record<
  MarketLocale,
  {
    label: string;
    currency: string;
    currencySymbol: string;
    exchange: string;
    indexSymbol: string;
    timezone: string;
    marketHours: string;
    regulator: string;
  }
> = {
  IN: {
    label: "India (NSE)",
    currency: "INR",
    currencySymbol: "₹",
    exchange: "NSE",
    indexSymbol: "NIFTY 50",
    timezone: "IST (UTC+5:30)",
    marketHours: "9:15 AM – 3:30 PM IST",
    regulator: "SEBI",
  },
  US: {
    label: "US (NYSE)",
    currency: "USD",
    currencySymbol: "$",
    exchange: "NYSE",
    indexSymbol: "S&P 500",
    timezone: "ET (UTC-5/-4)",
    marketHours: "9:30 AM – 4:00 PM ET",
    regulator: "SEC",
  },
};

export function formatMoney(value: number, locale: MarketLocale): string {
  const sym = LOCALES[locale].currencySymbol;
  const abs = Math.abs(value);
  const formatted =
    abs >= 10000000 && locale === "IN"
      ? `${(value / 10000000).toFixed(2)} Cr`
      : abs >= 100000 && locale === "IN"
        ? `${(value / 100000).toFixed(2)} L`
        : abs >= 1000000
          ? `${(value / 1000000).toFixed(2)}M`
          : value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  return `${sym}${formatted}`;
}

export async function getLocale(db: SQLiteDatabase): Promise<MarketLocale> {
  try {
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM settings WHERE key = 'locale'",
    );
    return row?.value === "US" ? "US" : "IN";
  } catch {
    return "IN";
  }
}

export async function setLocale(
  db: SQLiteDatabase,
  locale: MarketLocale,
): Promise<void> {
  await db.runAsync(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ('locale', ?)",
    locale,
  );
}
