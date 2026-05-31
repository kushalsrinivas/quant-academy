import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { Colors, Spacing } from "@/constants/theme";
import { getLastResult } from "@/lib/engine/shared-results";

export default function ResultsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const result = getLastResult();

  if (!result) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontSize: 16 }}>
          No results available
        </Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back to Builder</Text>
        </Pressable>
      </View>
    );
  }

  const metrics = [
    {
      label: "Total Return",
      value: `${(result.totalReturn * 100).toFixed(2)}%`,
      color: result.totalReturn >= 0 ? colors.success : colors.error,
    },
    {
      label: "Sharpe Ratio",
      value: result.sharpeRatio.toFixed(2),
      color:
        result.sharpeRatio >= 1
          ? colors.success
          : result.sharpeRatio >= 0
            ? colors.warning
            : colors.error,
    },
    {
      label: "Max Drawdown",
      value: `${(result.maxDrawdown * 100).toFixed(2)}%`,
      color: colors.error,
    },
    {
      label: "Win Rate",
      value: `${(result.winRate * 100).toFixed(1)}%`,
      color: result.winRate >= 0.5 ? colors.success : colors.warning,
    },
    {
      label: "Total Trades",
      value: String(result.totalTrades),
      color: colors.text,
    },
    {
      label: "Profit Factor",
      value: result.profitFactor.toFixed(2),
      color: result.profitFactor >= 1 ? colors.success : colors.error,
    },
  ];

  const beatMarket = result.totalReturn > result.buyHoldReturn;

  // Simplified equity curve visualization
  const curve = result.equityCurve;
  const minEq = Math.min(...curve.map((e) => e.value));
  const maxEq = Math.max(...curve.map((e) => e.value));
  const eqRange = maxEq - minEq || 1;
  const sampleSize = Math.min(curve.length, 60);
  const step = Math.floor(curve.length / sampleSize);
  const sampledCurve = curve.filter((_, i) => i % step === 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Strategy Name */}
      <View style={styles.header}>
        <Text style={[styles.strategyName, { color: colors.text }]}>
          {result.strategyName}
        </Text>
        <View
          style={[
            styles.resultBadge,
            { backgroundColor: beatMarket ? colors.success : colors.error },
          ]}
        >
          <Text style={styles.resultBadgeText}>
            {beatMarket
              ? "🏆 Beats Buy & Hold!"
              : "📉 Underperforms Buy & Hold"}
          </Text>
        </View>
      </View>

      {/* Metric Cards */}
      <View style={styles.metricsGrid}>
        {metrics.map((m) => (
          <View
            key={m.label}
            style={[
              styles.metricCard,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {m.label}
            </Text>
            <Text style={[styles.metricValue, { color: m.color }]}>
              {m.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Comparison */}
      <View
        style={[
          styles.compareCard,
          { backgroundColor: colors.backgroundElement },
        ]}
      >
        <Text style={[styles.compareTitle, { color: colors.text }]}>
          vs Buy & Hold
        </Text>
        <View style={styles.compareRow}>
          <View style={styles.compareItem}>
            <Text
              style={[styles.compareLabel, { color: colors.textSecondary }]}
            >
              Strategy
            </Text>
            <Text
              style={[
                styles.compareValue,
                {
                  color:
                    result.totalReturn >= 0 ? colors.success : colors.error,
                },
              ]}
            >
              {(result.totalReturn * 100).toFixed(2)}%
            </Text>
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 20 }}>vs</Text>
          <View style={styles.compareItem}>
            <Text
              style={[styles.compareLabel, { color: colors.textSecondary }]}
            >
              Buy & Hold
            </Text>
            <Text
              style={[
                styles.compareValue,
                {
                  color:
                    result.buyHoldReturn >= 0 ? colors.success : colors.error,
                },
              ]}
            >
              {(result.buyHoldReturn * 100).toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Equity Curve */}
      <View style={styles.curveSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Equity Curve
        </Text>
        <View style={styles.curveChart}>
          {sampledCurve.map((point, i) => {
            const height = ((point.value - minEq) / eqRange) * 100;
            const isPositive = point.value >= curve[0].value;
            return (
              <View key={i} style={styles.curveBarWrap}>
                <View
                  style={[
                    styles.curveBar,
                    {
                      height: `${Math.max(height, 2)}%`,
                      backgroundColor: isPositive
                        ? "rgba(16,185,129,0.7)"
                        : "rgba(239,68,68,0.7)",
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
        <View style={styles.curveLabels}>
          <Text style={[styles.curveLabel, { color: colors.textSecondary }]}>
            {curve[0]?.date}
          </Text>
          <Text style={[styles.curveLabel, { color: colors.textSecondary }]}>
            {curve[curve.length - 1]?.date}
          </Text>
        </View>
      </View>

      {/* Trade List */}
      <View style={styles.tradeSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Trades ({result.trades.length})
        </Text>
        {result.trades.map((t, i) => (
          <View
            key={i}
            style={[
              styles.tradeRow,
              {
                backgroundColor:
                  t.pnl >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
              },
            ]}
          >
            <View style={styles.tradeLeft}>
              <Text
                style={[styles.tradeDates, { color: colors.textSecondary }]}
              >
                {t.entryDate} → {t.exitDate}
              </Text>
              <Text style={[styles.tradePrices, { color: colors.text }]}>
                ₹{t.entryPrice} → ₹{t.exitPrice} × {t.quantity}
              </Text>
            </View>
            <View style={styles.tradeRight}>
              <Text
                style={[
                  styles.tradePnl,
                  { color: t.pnl >= 0 ? colors.success : colors.error },
                ]}
              >
                {t.pnl >= 0 ? "+" : ""}₹{t.pnl.toFixed(0)}
              </Text>
              <Text
                style={[
                  styles.tradeReturn,
                  { color: t.returnPct >= 0 ? colors.success : colors.error },
                ]}
              >
                {(t.returnPct * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Back to Builder</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
  },
  header: { padding: Spacing.three, gap: Spacing.two, alignItems: "center" },
  strategyName: { fontSize: 22, fontWeight: "700" },
  resultBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  resultBadgeText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  metricCard: { width: "47%", padding: Spacing.three, borderRadius: 12 },
  metricLabel: { fontSize: 12, fontWeight: "500" },
  metricValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "monospace",
    marginTop: 4,
  },
  compareCard: {
    margin: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
  },
  compareTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  compareItem: { alignItems: "center" },
  compareLabel: { fontSize: 12 },
  compareValue: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "monospace",
    marginTop: 4,
  },
  curveSection: { marginHorizontal: Spacing.three, marginTop: Spacing.three },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: Spacing.two },
  curveChart: {
    flexDirection: "row",
    height: 120,
    alignItems: "flex-end",
    gap: 1,
  },
  curveBarWrap: { flex: 1, height: "100%", justifyContent: "flex-end" },
  curveBar: { width: "100%", borderRadius: 1 },
  curveLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  curveLabel: { fontSize: 10 },
  tradeSection: { margin: Spacing.three, gap: Spacing.one },
  tradeRow: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  tradeLeft: { flex: 1 },
  tradeDates: { fontSize: 11 },
  tradePrices: { fontSize: 13, fontWeight: "500", marginTop: 2 },
  tradeRight: { alignItems: "flex-end" },
  tradePnl: { fontSize: 15, fontWeight: "700" },
  tradeReturn: { fontSize: 12, marginTop: 2 },
  backBtn: {
    margin: Spacing.three,
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  backBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
