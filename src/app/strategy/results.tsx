import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";

import { AchievementBanner } from "@/components/AchievementBanner";
import { SkiaLineChart } from "@/components/charts/SkiaCharts";
import { BacktestCard } from "@/components/share/ShareCards";
import { Colors, Spacing } from "@/constants/theme";
import {
  unlockMany,
  type AchievementDef,
} from "@/lib/db/achievements";
import { getBacktestCount, getBacktestRun } from "@/lib/db/backtests";
import { recordActivity } from "@/lib/db/streaks";
import { addXP, hasEarnedXPFor, XP_VALUES } from "@/lib/db/xp";
import { captureAndShare } from "@/lib/share/capture";
import {
  getLastResult,
  type SharedBacktestResult,
  type StoredBacktestConfig,
} from "@/lib/engine/shared-results";

interface LoadedView {
  runId: number;
  symbol: string;
  config: StoredBacktestConfig | null;
  result: SharedBacktestResult;
}

export default function ResultsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const [view, setView] = useState<LoadedView | null>(null);
  const [loading, setLoading] = useState(true);
  const [newUnlocks, setNewUnlocks] = useState<AchievementDef[]>([]);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<any>(null);
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - 48, 700);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (id) {
        const fromDb = await getBacktestRun(db, Number(id));
        if (!cancelled && fromDb) {
          setView({
            runId: fromDb.id,
            symbol: fromDb.symbol,
            config: fromDb.config,
            result: fromDb.result,
          });
          setLoading(false);
          return;
        }
      }
      const mem = getLastResult();
      if (!cancelled) {
        setView(
          mem
            ? { runId: 0, symbol: mem.symbol, config: null, result: mem }
            : null,
        );
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, db]);

  useEffect(() => {
    if (!view) return;
    const beatMarket = view.result.totalReturn > view.result.buyHoldReturn;
    (async () => {
      const ids: string[] = [];
      if (beatMarket) {
        ids.push("beat_market");
        if (
          view.runId > 0 &&
          !(await hasEarnedXPFor(db, "beat_market", `run:${view.runId}`))
        ) {
          await addXP(
            db,
            XP_VALUES.beat_market,
            "beat_market",
            `run:${view.runId}`,
          );
          await recordActivity(db, { xp: XP_VALUES.beat_market });
        }
      }
      if (view.result.sharpeRatio > 1.5) ids.push("sharp_thinker");
      if ((await getBacktestCount(db)) >= 10) ids.push("ten_backtests");
      setNewUnlocks(await unlockMany(db, ids));
    })();
  }, [view, db]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!view) {
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

  const { result } = view;

  const metrics = [
    {
      label: "Total Return",
      value: `${(result.totalReturn * 100).toFixed(2)}%`,
      color: result.totalReturn >= 0 ? colors.success : colors.error,
    },
    {
      label: "Annualized",
      value: `${(result.annualizedReturn * 100).toFixed(2)}%`,
      color: result.annualizedReturn >= 0 ? colors.success : colors.error,
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
      value: result.profitFactor === null ? "—" : result.profitFactor.toFixed(2),
      color:
        result.profitFactor === null || result.profitFactor >= 1
          ? colors.success
          : colors.error,
    },
  ];

  const beatMarket = result.totalReturn > result.buyHoldReturn;

  const equityValues = result.equityCurve.map((e) => e.value);
  const firstEq = result.equityCurve[0]?.value ?? 0;
  const lineColor = (result.equityCurve[result.equityCurve.length - 1]?.value ?? 0) >= firstEq
    ? "#10B981"
    : "#EF4444";

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    const ok = await captureAndShare(cardRef, "Share backtest card");
    setSharing(false);
    if (!ok) Alert.alert("Share unavailable", "Sharing is not available on this device.");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Stack.Screen options={{ title: result.strategyName.slice(0, 24), headerBackTitle: "Builder" }} />
      {/* Strategy Name */}
      <View style={styles.header}>
        <Text style={[styles.strategyName, { color: colors.text }]}>
          {result.strategyName}
        </Text>
        <Text style={[styles.symbolLine, { color: colors.textSecondary }]}>
          {view.symbol} · {result.equityCurve[0]?.date} →{" "}
          {result.equityCurve[result.equityCurve.length - 1]?.date}
          {view.config
            ? ` · ${view.config.slippageBps}bps + ₹${view.config.commission}/trade`
            : ""}
        </Text>
        <View
          style={[
            styles.resultBadge,
            { backgroundColor: beatMarket ? colors.success : colors.error },
          ]}
        >
          <Ionicons
            name={beatMarket ? "trophy" : "trending-down"}
            size={16}
            color="#fff"
          />
          <Text style={styles.resultBadgeText}>
            {beatMarket ? "Beats Buy & Hold!" : "Underperforms Buy & Hold"}
          </Text>
        </View>
      </View>

      {newUnlocks.length > 0 && (
        <View style={styles.unlockWrap}>
          <AchievementBanner achievements={newUnlocks} />
        </View>
      )}

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
        <SkiaLineChart
          data={equityValues.filter((_, i) => i % Math.max(1, Math.floor(equityValues.length / 120)) === 0)}
          width={chartWidth}
          height={160}
          color={lineColor}
          colors={colors as unknown as Record<string, string>}
        />
        <View style={styles.curveLabels}>
          <Text style={[styles.curveLabel, { color: colors.textSecondary }]}>
            {result.equityCurve[0]?.date}
          </Text>
          <Text style={[styles.curveLabel, { color: colors.textSecondary }]}>
            {result.equityCurve[result.equityCurve.length - 1]?.date}
          </Text>
        </View>
      </View>

      <Pressable style={styles.shareBtn} onPress={handleShare} disabled={sharing}>
        <Ionicons name="share-social" size={16} color="#fff" />
        <Text style={styles.backBtnText}>{sharing ? "Preparing…" : "Share Result Card"}</Text>
      </Pressable>

      <View style={styles.offscreen} pointerEvents="none">
        <ViewShot ref={cardRef} options={{ format: "png", quality: 1 }}>
          <BacktestCard result={result} symbol={view.symbol} />
        </ViewShot>
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
        <View style={styles.backBtnContent}>
          <Ionicons name="arrow-back" size={16} color="#fff" />
          <Text style={styles.backBtnText}>Back to Builder</Text>
        </View>
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
  resultBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
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
  shareBtn: {
    marginHorizontal: Spacing.three,
    marginTop: Spacing.three,
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  offscreen: { position: "absolute", left: -1000, top: 0, opacity: 0 },
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
  backBtnContent: { flexDirection: "row", alignItems: "center", gap: 6 },
  symbolLine: { fontSize: 12, textAlign: "center" },
  unlockWrap: { marginHorizontal: Spacing.three, marginBottom: Spacing.two },
});
