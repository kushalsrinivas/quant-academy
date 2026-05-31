import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
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
import { saveStrategy } from "@/lib/db/strategies";
import { addXP, XP_VALUES } from "@/lib/db/xp";
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

const INDICATORS = ["price", "sma", "ema", "rsi", "momentum"];
const OPERATORS = [">", "<", ">=", "<=", "crosses_above", "crosses_below"];

function generateBars(n: number) {
  const bars: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[] = [];
  let price = 100;
  const d = new Date("2022-01-03");
  for (let i = 0; i < n; i++) {
    const ret = (Math.random() - 0.498) * 0.03;
    const open = price;
    const close = open * (1 + ret);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    bars.push({
      date: d.toISOString().split("T")[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.round(1e6 + Math.random() * 5e6),
    });
    price = close;
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    if (d.getDay() === 6) d.setDate(d.getDate() + 2);
  }
  return bars;
}

function calcSMA(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    let s = 0;
    for (let j = i - period + 1; j <= i; j++) s += data[j];
    return s / period;
  });
}

function calcRSI(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [null];
  for (let i = 1; i < data.length; i++) {
    if (i < period + 1) {
      result.push(null);
      continue;
    }
    let gains = 0,
      losses = 0;
    for (let j = i - period; j < i; j++) {
      const d = data[j + 1] - data[j];
      if (d > 0) gains += d;
      else losses -= d;
    }
    const ag = gains / period;
    const al = losses / period;
    result.push(al === 0 ? 100 : 100 - 100 / (1 + ag / al));
  }
  return result;
}

function getIndicator(
  closes: number[],
  name: string,
  period: number,
): (number | null)[] {
  switch (name) {
    case "price":
      return closes.map((c) => c);
    case "sma":
      return calcSMA(closes, period);
    case "ema":
      return calcSMA(closes, period); // simplified
    case "rsi":
      return calcRSI(closes, period);
    case "momentum":
      return closes.map((c, i) => (i < period ? null : c - closes[i - period]));
    default:
      return closes.map(() => null);
  }
}

export default function StrategyBuilderScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const [name, setName] = useState("My Strategy");
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
      const bars = generateBars(500);
      const closes = bars.map((b) => b.close);
      const initCap = parseFloat(capital) || 100000;
      const position = (parseFloat(posSize) || 100) / 100;
      const slip = parseFloat(slippage) || 10;
      const comm = parseFloat(commission) || 20;

      const buyIndicators = buyConditions.map((c) =>
        getIndicator(closes, c.indicator, parseInt(c.period) || 14),
      );
      const sellIndicators = sellConditions.map((c) =>
        getIndicator(closes, c.indicator, parseInt(c.period) || 14),
      );

      let cash = initCap;
      let shares = 0;
      let entryPrice = 0;
      let entryDate = "";
      const tradesList: SharedBacktestResult["trades"] = [];
      const equity: { date: string; value: number }[] = [];

      for (let i = 0; i < bars.length; i++) {
        const price = closes[i];
        equity.push({ date: bars[i].date, value: cash + shares * price });

        if (shares === 0) {
          const allMet = buyConditions.every((c, ci) => {
            const iv = buyIndicators[ci][i];
            const tv = parseFloat(c.value);
            if (iv === null || isNaN(tv)) return false;
            switch (c.operator) {
              case ">":
                return iv > tv;
              case "<":
                return iv < tv;
              case ">=":
                return iv >= tv;
              case "<=":
                return iv <= tv;
              case "crosses_above":
                return (
                  i > 0 && (buyIndicators[ci][i - 1] ?? 0) <= tv && iv > tv
                );
              case "crosses_below":
                return (
                  i > 0 && (buyIndicators[ci][i - 1] ?? 0) >= tv && iv < tv
                );
              default:
                return false;
            }
          });
          if (allMet) {
            const ep = price * (1 + slip / 10000);
            const avail = cash * position - comm;
            shares = Math.floor(avail / ep);
            if (shares > 0) {
              entryPrice = ep;
              entryDate = bars[i].date;
              cash -= shares * ep + comm;
            }
          }
        } else {
          const allMet = sellConditions.every((c, ci) => {
            const iv = sellIndicators[ci][i];
            const tv = parseFloat(c.value);
            if (iv === null || isNaN(tv)) return false;
            switch (c.operator) {
              case ">":
                return iv > tv;
              case "<":
                return iv < tv;
              case ">=":
                return iv >= tv;
              case "<=":
                return iv <= tv;
              case "crosses_above":
                return (
                  i > 0 && (sellIndicators[ci][i - 1] ?? 0) <= tv && iv > tv
                );
              case "crosses_below":
                return (
                  i > 0 && (sellIndicators[ci][i - 1] ?? 0) >= tv && iv < tv
                );
              default:
                return false;
            }
          });
          if (allMet) {
            const ep = price * (1 - slip / 10000);
            const pnl = (ep - entryPrice) * shares - comm;
            tradesList.push({
              entryDate,
              exitDate: bars[i].date,
              entryPrice: Math.round(entryPrice * 100) / 100,
              exitPrice: Math.round(ep * 100) / 100,
              quantity: shares,
              pnl: Math.round(pnl * 100) / 100,
              returnPct:
                Math.round(((ep - entryPrice) / entryPrice) * 10000) / 10000,
            });
            cash += shares * ep - comm;
            shares = 0;
          }
        }
      }

      if (shares > 0) {
        const fp = closes[closes.length - 1];
        tradesList.push({
          entryDate,
          exitDate: bars[bars.length - 1].date,
          entryPrice: Math.round(entryPrice * 100) / 100,
          exitPrice: Math.round(fp * 100) / 100,
          quantity: shares,
          pnl: Math.round((fp - entryPrice) * shares * 100) / 100,
          returnPct:
            Math.round(((fp - entryPrice) / entryPrice) * 10000) / 10000,
        });
        cash += shares * fp;
      }

      const finalEq = equity[equity.length - 1]?.value ?? initCap;
      const totalReturn = (finalEq - initCap) / initCap;
      const bhReturn = (closes[closes.length - 1] - closes[0]) / closes[0];
      const dailyRet = equity
        .slice(1)
        .map((e, i) => (e.value - equity[i].value) / equity[i].value);
      const avgR = dailyRet.reduce((s, r) => s + r, 0) / dailyRet.length;
      const stdR = Math.sqrt(
        dailyRet.reduce((s, r) => s + (r - avgR) ** 2, 0) / dailyRet.length,
      );
      const sharpe = stdR > 0 ? (avgR / stdR) * Math.sqrt(252) : 0;
      let maxDD = 0,
        peak = 0;
      for (const e of equity) {
        if (e.value > peak) peak = e.value;
        const dd = (peak - e.value) / peak;
        if (dd > maxDD) maxDD = dd;
      }
      const wins = tradesList.filter((t) => t.pnl > 0);
      const winRate =
        tradesList.length > 0 ? wins.length / tradesList.length : 0;
      const grossP = wins.reduce((s, t) => s + t.pnl, 0);
      const grossL = Math.abs(
        tradesList.filter((t) => t.pnl <= 0).reduce((s, t) => s + t.pnl, 0),
      );
      const pf = grossL > 0 ? grossP / grossL : grossP > 0 ? 999 : 0;

      const result: SharedBacktestResult = {
        totalReturn: Math.round(totalReturn * 10000) / 10000,
        annualizedReturn:
          Math.round(
            (Math.pow(1 + totalReturn, 252 / bars.length) - 1) * 10000,
          ) / 10000,
        sharpeRatio: Math.round(sharpe * 100) / 100,
        maxDrawdown: Math.round(maxDD * 10000) / 10000,
        winRate: Math.round(winRate * 10000) / 10000,
        totalTrades: tradesList.length,
        profitFactor: Math.round(pf * 100) / 100,
        buyHoldReturn: Math.round(bhReturn * 10000) / 10000,
        trades: tradesList,
        equityCurve: equity,
        strategyName: name,
      };

      setLastResult(result);
      await addXP(db, XP_VALUES.backtest, "backtest", name);
      router.push("/strategy/results" as never);
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
    });
    Alert.alert("Saved", "Strategy saved successfully");
  }, [
    db,
    name,
    buyConditions,
    sellConditions,
    capital,
    posSize,
    slippage,
    commission,
  ]);

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
                      {ind.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {c.indicator !== "price" && (
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
            <Text style={styles.removeBtnText}>✕</Text>
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
            ["Capital (₹)", capital, setCapital],
            ["Position %", posSize, setPosSize],
            ["Slippage (bps)", slippage, setSlippage],
            ["Commission (₹)", commission, setCommission],
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
          <Text style={styles.runBtnText}>
            {running ? "Running..." : "▶ RUN BACKTEST"}
          </Text>
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
  removeBtnText: { color: "#EF4444", fontSize: 16, fontWeight: "600" },
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
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  saveBtnText: { fontSize: 15, fontWeight: "600" },
});
