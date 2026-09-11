import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import { Colors, Spacing } from "@/constants/theme";
import {
  NIFTY50_DAILY,
  STOCK_DATA,
  STOCK_NAMES,
} from "@/data/datasets/nifty50-daily";
import {
  getAchievementDef,
  unlockAchievement,
} from "@/lib/db/achievements";
import { saveBacktestRun } from "@/lib/db/backtests";
import { getStrategyCount, saveStrategy } from "@/lib/db/strategies";
import { getTodayKey, recordActivity } from "@/lib/db/streaks";
import { addXP, hasEarnedXPFor, XP_VALUES } from "@/lib/db/xp";
import { runBacktest as runEngineBacktest } from "@/lib/engine/backtest";
import { getLocale, LOCALES, type MarketLocale } from "@/lib/market/locale";
import {
  setLastResult,
  type SharedBacktestResult,
} from "@/lib/engine/shared-results";

interface Condition {
  indicator: string;
  period: string;
  operator: string;
  value: string;
}

const INDICATORS = [
  "price",
  "sma",
  "ema",
  "rsi",
  "momentum",
  "macd",
  "macd_signal",
  "bollinger_upper",
  "bollinger_lower",
];
const INDICATOR_LABELS: Record<string, string> = {
  price: "PRICE",
  sma: "SMA",
  ema: "EMA",
  rsi: "RSI",
  momentum: "MOM",
  macd: "MACD",
  macd_signal: "MACD-SIG",
  bollinger_upper: "BB-UP",
  bollinger_lower: "BB-LO",
};
const OPERATORS = [">", "<", ">=", "<=", "crosses_above", "crosses_below"];

const NIFTY_SYMBOL = "NIFTY 50";
const SYMBOLS = [NIFTY_SYMBOL, ...STOCK_NAMES];

function paramsForIndicator(
  indicator: string,
  period: number,
): Record<string, number> {
  switch (indicator) {
    case "macd":
    case "macd_signal":
      return { fast: 12, slow: 26, signal: 9 };
    case "bollinger_upper":
    case "bollinger_lower":
      return { period, stdDev: 2 };
    case "sma":
    case "ema":
    case "rsi":
    case "momentum":
      return { period };
    default:
      return {};
  }
}

function datasetForSymbol(symbol: string) {
  return symbol === NIFTY_SYMBOL ? NIFTY50_DAILY : STOCK_DATA[symbol];
}

export default function StrategyBuilderScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const [name, setName] = useState("My Strategy");
  const [symbol, setSymbol] = useState<string>(NIFTY_SYMBOL);
  const [buyConditions, setBuyConditions] = useState<Condition[]>([
    { indicator: "rsi", period: "14", operator: "<", value: "30" },
  ]);
  const [sellConditions, setSellConditions] = useState<Condition[]>([
    { indicator: "rsi", period: "14", operator: ">", value: "70" },
  ]);
  const [capital, setCapital] = useState("100000");
  const [posSize, setPosSize] = useState("100");
  const [slippage, setSlippage] = useState("10");
  const [commission, setCommission] = useState("20");
  const [running, setRunning] = useState(false);
  const [locale, setLocaleState] = useState<MarketLocale>("IN");

  useEffect(() => {
    getLocale(db).then(setLocaleState).catch(() => {});
  }, [db]);
  const cur = LOCALES[locale].currencySymbol;

  const addCondition = (isBuy: boolean) => {
    const newCond: Condition = {
      indicator: "sma",
      period: "20",
      operator: ">",
      value: "0",
    };
    if (isBuy) setBuyConditions([...buyConditions, newCond]);
    else setSellConditions([...sellConditions, newCond]);
  };

  const updateCondition = (
    isBuy: boolean,
    idx: number,
    field: keyof Condition,
    val: string,
  ) => {
    const list = isBuy ? [...buyConditions] : [...sellConditions];
    list[idx] = { ...list[idx], [field]: val };
    if (isBuy) setBuyConditions(list);
    else setSellConditions(list);
  };

  const removeCondition = (isBuy: boolean, idx: number) => {
    if (isBuy) setBuyConditions(buyConditions.filter((_, i) => i !== idx));
    else setSellConditions(sellConditions.filter((_, i) => i !== idx));
  };

  const runBacktest = useCallback(async () => {
    if (buyConditions.length === 0 || sellConditions.length === 0) {
      Alert.alert("Error", "Add at least one buy and one sell condition");
      return;
    }
    setRunning(true);

    try {
      const bars = datasetForSymbol(symbol);
      if (!bars || bars.length === 0) {
        Alert.alert("Error", "No market data available for this symbol");
        return;
      }
      const parsedCapital = parseFloat(capital);
      const parsedPosSize = parseFloat(posSize);
      const parsedSlippage = parseFloat(slippage);
      const parsedCommission = parseFloat(commission);
      const initCap = Number.isNaN(parsedCapital) ? 100000 : parsedCapital;
      const position = (Number.isNaN(parsedPosSize) ? 100 : parsedPosSize) / 100;
      const slip = Number.isNaN(parsedSlippage) ? 10 : parsedSlippage;
      const comm = Number.isNaN(parsedCommission) ? 20 : parsedCommission;

      const toEngineCondition = (
        c: Condition,
      ): import("@/lib/engine/backtest").Condition => {
        const numericValue = parseFloat(c.value);
        return {
          indicator: c.indicator,
          params: paramsForIndicator(c.indicator, parseInt(c.period, 10) || 14),
          operator: c.operator as import("@/lib/engine/backtest").ComparisonOp,
          value: Number.isNaN(numericValue) ? c.value.trim() : numericValue,
        };
      };
      const engineResult = runEngineBacktest(bars, {
        buyConditions: buyConditions.map(toEngineCondition),
        sellConditions: sellConditions.map(toEngineCondition),
        initialCapital: initCap,
        positionSize: position,
        slippage: slip,
        commission: comm,
      });

      const result: SharedBacktestResult = {
        totalReturn: engineResult.totalReturn,
        annualizedReturn: engineResult.annualizedReturn,
        sharpeRatio: engineResult.sharpeRatio,
        maxDrawdown: engineResult.maxDrawdown,
        winRate: engineResult.winRate,
        totalTrades: engineResult.totalTrades,
        profitFactor: Number.isFinite(engineResult.profitFactor)
          ? engineResult.profitFactor
          : null,
        buyHoldReturn: engineResult.buyHoldReturn,
        trades: engineResult.trades,
        equityCurve: engineResult.equityCurve,
        strategyName: name,
        symbol,
      };

      const runId = await saveBacktestRun(db, {
        strategyName: name,
        symbol,
        config: {
          buyConditions,
          sellConditions,
          initialCapital: initCap,
          positionSizePct: position * 100,
          slippageBps: slip,
          commission: comm,
        },
        result,
      });

      setLastResult(result);
      const xpSourceId = `${name}:${getTodayKey()}`;
      if (!(await hasEarnedXPFor(db, "backtest", xpSourceId))) {
        await addXP(db, XP_VALUES.backtest, "backtest", xpSourceId);
        await recordActivity(db, { xp: XP_VALUES.backtest });
      }
      router.push(`/strategy/results?id=${runId}` as never);
    } finally {
      setRunning(false);
    }
  }, [
    buyConditions,
    sellConditions,
    capital,
    posSize,
    slippage,
    commission,
    name,
    symbol,
    db,
    router,
  ]);

  const handleSave = useCallback(async () => {
    await saveStrategy(db, name, {
      buyConditions,
      sellConditions,
      capital,
      posSize,
      slippage,
      commission,
      symbol,
    });
    let message = "Strategy saved successfully";
    if ((await getStrategyCount(db)) >= 5) {
      if (await unlockAchievement(db, "strategy_5")) {
        const def = getAchievementDef("strategy_5");
        if (def) message += `\nAchievement unlocked: ${def.title}`;
      }
    }
    Alert.alert("Saved", message);
  }, [
    db,
    name,
    buyConditions,
    sellConditions,
    capital,
    posSize,
    slippage,
    commission,
    symbol,
  ]);

  const activeBars = datasetForSymbol(symbol) ?? [];

  const renderConditions = (conditions: Condition[], isBuy: boolean) => (
    <View style={styles.condSection}>
      <Text
        style={[
          styles.condTitle,
          { color: isBuy ? colors.bidGreen : colors.askRed },
        ]}
      >
        {isBuy ? "BUY" : "SELL"} Conditions
      </Text>
      {conditions.map((c, idx) => (
        <View
          key={idx}
          style={[
            styles.condRow,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <View style={styles.condPickers}>
            <View style={styles.pickerWrap}>
              <Text
                style={[styles.pickerLabel, { color: colors.textSecondary }]}
              >
                Indicator
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.pickerRow}>
                  {INDICATORS.map((ind) => (
                    <Pressable
                      key={ind}
                      style={[
                        styles.miniBtn,
                        c.indicator === ind && styles.miniBtnActive,
                      ]}
                      onPress={() =>
                        updateCondition(isBuy, idx, "indicator", ind)
                      }
                    >
                      <Text
                        style={[
                          styles.miniBtnText,
                          c.indicator === ind && styles.miniBtnTextActive,
                        ]}
                      >
                        {INDICATOR_LABELS[ind] ?? ind.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
            {(c.indicator === "macd" || c.indicator === "macd_signal") && (
              <Text
                style={[styles.fixedParams, { color: colors.textSecondary }]}
              >
                Fixed 12 / 26 / 9
              </Text>
            )}
            {c.indicator !== "price" &&
              c.indicator !== "macd" &&
              c.indicator !== "macd_signal" && (
              <View style={styles.paramInput}>
                <Text
                  style={[styles.pickerLabel, { color: colors.textSecondary }]}
                >
                  Period
                </Text>
                <TextInput
                  style={[
                    styles.smallInput,
                    {
                      color: colors.text,
                      borderColor: colors.backgroundSelected,
                    },
                  ]}
                  value={c.period}
                  onChangeText={(v) => updateCondition(isBuy, idx, "period", v)}
                  keyboardType="number-pad"
                />
              </View>
            )}
            <View style={styles.pickerWrap}>
              <Text
                style={[styles.pickerLabel, { color: colors.textSecondary }]}
              >
                Operator
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.pickerRow}>
                  {OPERATORS.map((op) => (
                    <Pressable
                      key={op}
                      style={[
                        styles.miniBtn,
                        c.operator === op && styles.miniBtnActive,
                      ]}
                      onPress={() =>
                        updateCondition(isBuy, idx, "operator", op)
                      }
                    >
                      <Text
                        style={[
                          styles.miniBtnText,
                          c.operator === op && styles.miniBtnTextActive,
                        ]}
                      >
                        {op}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
            <View style={styles.paramInput}>
              <Text
                style={[styles.pickerLabel, { color: colors.textSecondary }]}
              >
                Value
              </Text>
              <TextInput
                style={[
                  styles.smallInput,
                  {
                    color: colors.text,
                    borderColor: colors.backgroundSelected,
                  },
                ]}
                value={c.value}
                onChangeText={(v) => updateCondition(isBuy, idx, "value", v)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <Pressable
            style={styles.removeBtn}
            onPress={() => removeCondition(isBuy, idx)}
          >
            <Ionicons name="close" size={16} color="#EF4444" />
          </Pressable>
        </View>
      ))}
      <Pressable
        style={[styles.addBtn, { backgroundColor: colors.backgroundElement }]}
        onPress={() => addCondition(isBuy)}
      >
        <Text style={[styles.addBtnText, { color: colors.text }]}>
          + Add Condition
        </Text>
      </Pressable>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <Stack.Screen options={{ title: "Strategy Builder", headerBackTitle: "Sandbox" }} />
      <View style={styles.nameSection}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Strategy Name
        </Text>
        <TextInput
          style={[
            styles.nameInput,
            { color: colors.text, borderColor: colors.backgroundSelected },
          ]}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.nameSection}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Market Data
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.symbolRow}>
            {SYMBOLS.map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.miniBtn,
                  styles.symbolBtn,
                  s === symbol && styles.miniBtnActive,
                ]}
                onPress={() => setSymbol(s)}
              >
                <Text
                  style={[
                    styles.miniBtnText,
                    s === symbol && styles.miniBtnTextActive,
                  ]}
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        {activeBars.length > 0 && (
          <Text style={[styles.dataRange, { color: colors.textSecondary }]}>
            {activeBars.length} daily bars · {activeBars[0].date} →{" "}
            {activeBars[activeBars.length - 1].date} · {LOCALES[locale].exchange}{" "}
            {LOCALES[locale].marketHours}
          </Text>
        )}
      </View>

      {renderConditions(buyConditions, true)}
      {renderConditions(sellConditions, false)}

      <View
        style={[
          styles.paramsSection,
          { backgroundColor: colors.backgroundElement },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Parameters
        </Text>
        <View style={styles.paramGrid}>
          {[
            [`Capital (${cur})`, capital, setCapital],
            ["Position %", posSize, setPosSize],
            ["Slippage (bps)", slippage, setSlippage],
            [`Commission (${cur})`, commission, setCommission],
          ].map(([label, val, setter]) => (
            <View key={label as string} style={styles.paramItem}>
              <Text
                style={[styles.paramLabel, { color: colors.textSecondary }]}
              >
                {label as string}
              </Text>
              <TextInput
                style={[
                  styles.paramInputField,
                  {
                    color: colors.text,
                    borderColor: colors.backgroundSelected,
                  },
                ]}
                value={val as string}
                onChangeText={setter as (v: string) => void}
                keyboardType="decimal-pad"
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.runBtn, { opacity: running ? 0.6 : 1 }]}
          onPress={runBacktest}
          disabled={running}
        >
          <View style={styles.runBtnContent}>
            {!running && <Ionicons name="play" size={16} color="#fff" />}
            <Text style={styles.runBtnText}>
              {running ? "Running..." : "RUN BACKTEST"}
            </Text>
          </View>
        </Pressable>
        <Pressable
          style={[
            styles.saveBtn,
            { backgroundColor: colors.backgroundElement },
          ]}
          onPress={handleSave}
        >
          <Text style={[styles.saveBtnText, { color: colors.text }]}>
            Save Strategy
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  nameSection: { padding: Spacing.three, gap: Spacing.one },
  label: { fontSize: 12, fontWeight: "600" },
  nameInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  condSection: {
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  condTitle: { fontSize: 16, fontWeight: "700" },
  condRow: {
    padding: Spacing.three,
    borderRadius: 12,
    flexDirection: "row",
    gap: Spacing.two,
  },
  condPickers: { flex: 1, gap: Spacing.two },
  pickerWrap: { gap: 4 },
  pickerLabel: { fontSize: 11, fontWeight: "500" },
  pickerRow: { flexDirection: "row", gap: 4, flexWrap: "wrap" },
  miniBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(128,128,128,0.15)",
  },
  miniBtnActive: { backgroundColor: "#3B82F6" },
  miniBtnText: { fontSize: 10, fontWeight: "600", color: "#888" },
  miniBtnTextActive: { color: "#fff" },
  fixedParams: { fontSize: 11, fontWeight: "500" },
  symbolRow: { flexDirection: "row", gap: 6, paddingVertical: 2 },
  symbolBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  dataRange: { fontSize: 11, marginTop: 2 },
  paramInput: { gap: 4 },
  smallInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    width: 80,
  },
  removeBtn: { padding: 4 },
  addBtn: { paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  addBtnText: { fontSize: 13, fontWeight: "600" },
  paramsSection: {
    margin: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    gap: Spacing.two,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  paramGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  paramItem: { width: "47%", gap: 4 },
  paramLabel: { fontSize: 11, fontWeight: "500" },
  paramInputField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
  },
  actions: { padding: Spacing.three, gap: Spacing.two },
  runBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  runBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  runBtnContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  saveBtnText: { fontSize: 15, fontWeight: "600" },
});
