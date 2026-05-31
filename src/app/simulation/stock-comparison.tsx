import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { Colors, Spacing } from "@/constants/theme";

const STOCKS = ["RELIANCE", "TCS", "INFY", "HDFC", "ITC"];

function generateReturns(seed: number, n: number = 250): number[] {
  let s = seed;
  const lcg = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  return Array.from({ length: n }, () => (lcg() - 0.5) * 0.04);
}

const STOCK_RETURNS: Record<string, number[]> = {
  RELIANCE: generateReturns(42),
  TCS: generateReturns(73),
  INFY: generateReturns(101),
  HDFC: generateReturns(59),
  ITC: generateReturns(88),
};

function calcMean(data: number[]): number {
  return data.reduce((s, v) => s + v, 0) / data.length;
}

function calcStd(data: number[]): number {
  const m = calcMean(data);
  const v = data.reduce((s, v) => s + (v - m) ** 2, 0) / (data.length - 1);
  return Math.sqrt(v);
}

function calcCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  const mx = calcMean(x.slice(0, n));
  const my = calcMean(y.slice(0, n));
  let cov = 0,
    vx = 0,
    vy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    cov += dx * dy;
    vx += dx * dx;
    vy += dy * dy;
  }
  const denom = Math.sqrt(vx * vy);
  return denom === 0 ? 0 : cov / denom;
}

function calcCovariance(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  const mx = calcMean(x.slice(0, n));
  const my = calcMean(y.slice(0, n));
  let cov = 0;
  for (let i = 0; i < n; i++) cov += (x[i] - mx) * (y[i] - my);
  return cov / (n - 1);
}

export default function StockComparisonScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const [stock1, setStock1] = useState("RELIANCE");
  const [stock2, setStock2] = useState("TCS");

  const returns1 = STOCK_RETURNS[stock1];
  const returns2 = STOCK_RETURNS[stock2];

  const stats1 = useMemo(
    () => ({
      mean: calcMean(returns1),
      std: calcStd(returns1),
      min: Math.min(...returns1),
      max: Math.max(...returns1),
    }),
    [returns1],
  );

  const stats2 = useMemo(
    () => ({
      mean: calcMean(returns2),
      std: calcStd(returns2),
      min: Math.min(...returns2),
      max: Math.max(...returns2),
    }),
    [returns2],
  );

  const corr = useMemo(
    () => calcCorrelation(returns1, returns2),
    [returns1, returns2],
  );
  const cov = useMemo(
    () => calcCovariance(returns1, returns2),
    [returns1, returns2],
  );

  const corrColor =
    corr > 0.3 ? colors.success : corr < -0.3 ? colors.error : colors.warning;

  const histogram1 = useMemo(() => {
    const bins = 20;
    const min = -0.04;
    const width = 0.08 / bins;
    const counts = new Array(bins).fill(0);
    for (const r of returns1) {
      let idx = Math.floor((r - min) / width);
      if (idx < 0) idx = 0;
      if (idx >= bins) idx = bins - 1;
      counts[idx]++;
    }
    return counts;
  }, [returns1]);

  const histogram2 = useMemo(() => {
    const bins = 20;
    const min = -0.04;
    const width = 0.08 / bins;
    const counts = new Array(bins).fill(0);
    for (const r of returns2) {
      let idx = Math.floor((r - min) / width);
      if (idx < 0) idx = 0;
      if (idx >= bins) idx = bins - 1;
      counts[idx]++;
    }
    return counts;
  }, [returns2]);

  const maxHist = Math.max(...histogram1, ...histogram2, 1);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Stock Selectors */}
      <View style={styles.selectorSection}>
        <View style={styles.selectorCol}>
          <Text style={[styles.selectorLabel, { color: colors.textSecondary }]}>
            Stock A
          </Text>
          <View style={styles.selectorRow}>
            {STOCKS.map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.stockBtn,
                  {
                    backgroundColor:
                      stock1 === s ? "#3B82F6" : colors.backgroundElement,
                  },
                ]}
                onPress={() => setStock1(s)}
              >
                <Text
                  style={[
                    styles.stockBtnText,
                    { color: stock1 === s ? "#fff" : colors.text },
                  ]}
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.selectorCol}>
          <Text style={[styles.selectorLabel, { color: colors.textSecondary }]}>
            Stock B
          </Text>
          <View style={styles.selectorRow}>
            {STOCKS.map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.stockBtn,
                  {
                    backgroundColor:
                      stock2 === s ? "#EF4444" : colors.backgroundElement,
                  },
                ]}
                onPress={() => setStock2(s)}
              >
                <Text
                  style={[
                    styles.stockBtnText,
                    { color: stock2 === s ? "#fff" : colors.text },
                  ]}
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Correlation & Covariance */}
      <View
        style={[styles.corrCard, { backgroundColor: colors.backgroundElement }]}
      >
        <View style={styles.corrRow}>
          <View style={styles.corrItem}>
            <Text style={[styles.corrLabel, { color: colors.textSecondary }]}>
              Correlation
            </Text>
            <Text style={[styles.corrValue, { color: corrColor }]}>
              {corr.toFixed(4)}
            </Text>
          </View>
          <View style={styles.corrItem}>
            <Text style={[styles.corrLabel, { color: colors.textSecondary }]}>
              Covariance
            </Text>
            <Text style={[styles.corrValue, { color: colors.text }]}>
              {cov.toExponential(4)}
            </Text>
          </View>
        </View>
        <Text style={[styles.corrNote, { color: colors.textSecondary }]}>
          {Math.abs(corr) > 0.7
            ? "Strong relationship"
            : Math.abs(corr) > 0.3
              ? "Moderate relationship"
              : "Weak relationship"}
        </Text>
      </View>

      {/* Stats Comparison */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Statistics
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsHeader}>
            <Text style={[styles.statsCell, { color: colors.textSecondary }]}>
              Metric
            </Text>
            <Text style={[styles.statsCell, { color: "#3B82F6" }]}>
              {stock1}
            </Text>
            <Text style={[styles.statsCell, { color: "#EF4444" }]}>
              {stock2}
            </Text>
          </View>
          {[
            [
              "Mean Return",
              (stats1.mean * 100).toFixed(3) + "%",
              (stats2.mean * 100).toFixed(3) + "%",
            ],
            [
              "Std Dev",
              (stats1.std * 100).toFixed(3) + "%",
              (stats2.std * 100).toFixed(3) + "%",
            ],
            [
              "Min",
              (stats1.min * 100).toFixed(2) + "%",
              (stats2.min * 100).toFixed(2) + "%",
            ],
            [
              "Max",
              (stats1.max * 100).toFixed(2) + "%",
              (stats2.max * 100).toFixed(2) + "%",
            ],
          ].map(([label, v1, v2]) => (
            <View key={label} style={styles.statsRow}>
              <Text style={[styles.statsCell, { color: colors.textSecondary }]}>
                {label}
              </Text>
              <Text style={[styles.statsCell, { color: colors.text }]}>
                {v1}
              </Text>
              <Text style={[styles.statsCell, { color: colors.text }]}>
                {v2}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Return Distribution */}
      <View style={styles.histSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Return Distribution
        </Text>
        <View style={styles.histChart}>
          {histogram1.map((count, i) => (
            <View key={i} style={styles.histBarCol}>
              <View
                style={[
                  styles.histBar,
                  {
                    height: (count / maxHist) * 80,
                    backgroundColor: "rgba(59,130,246,0.6)",
                  },
                ]}
              />
              <View
                style={[
                  styles.histBar,
                  {
                    height: (histogram2[i] / maxHist) * 80,
                    backgroundColor: "rgba(239,68,68,0.6)",
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <View style={styles.histLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {stock1}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {stock2}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  selectorSection: { padding: Spacing.three, gap: Spacing.three },
  selectorCol: { gap: Spacing.one },
  selectorLabel: { fontSize: 12, fontWeight: "600" },
  selectorRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  stockBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  stockBtnText: { fontSize: 12, fontWeight: "600" },
  corrCard: {
    marginHorizontal: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
  },
  corrRow: { flexDirection: "row", gap: Spacing.four },
  corrItem: { flex: 1 },
  corrLabel: { fontSize: 12, fontWeight: "500" },
  corrValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "monospace",
    marginTop: 4,
  },
  corrNote: { fontSize: 12, marginTop: Spacing.two },
  statsSection: { marginHorizontal: Spacing.three, marginTop: Spacing.three },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: Spacing.two },
  statsGrid: { gap: 4 },
  statsHeader: { flexDirection: "row" },
  statsRow: { flexDirection: "row" },
  statsCell: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 4,
    fontFamily: "monospace",
  },
  histSection: { marginHorizontal: Spacing.three, marginTop: Spacing.three },
  histChart: {
    flexDirection: "row",
    height: 100,
    alignItems: "flex-end",
    gap: 2,
  },
  histBarCol: { flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 1 },
  histBar: { flex: 1, borderRadius: 2 },
  histLegend: {
    flexDirection: "row",
    gap: Spacing.four,
    marginTop: Spacing.two,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12 },
});
