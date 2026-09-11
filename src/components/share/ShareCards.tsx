import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { SharedBacktestResult } from "@/lib/engine/shared-results";

export function BacktestCard({
  result,
  symbol,
}: {
  result: SharedBacktestResult;
  symbol: string;
}) {
  const beat = result.totalReturn > result.buyHoldReturn;
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>QUANT ACADEMY</Text>
        <View style={[styles.badge, { backgroundColor: beat ? "#10B981" : "#EF4444" }]}>
          <Ionicons name={beat ? "trophy" : "trending-down"} size={12} color="#fff" />
          <Text style={styles.badgeText}>
            {beat ? "BEATS BUY & HOLD" : "VS BUY & HOLD"}
          </Text>
        </View>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {result.strategyName}
      </Text>
      <Text style={styles.symbol}>
        {symbol} · {result.totalTrades} trades
      </Text>
      <View style={styles.grid}>
        <View style={styles.cell}>
          <Text style={styles.label}>Return</Text>
          <Text style={[styles.value, { color: result.totalReturn >= 0 ? "#10B981" : "#EF4444" }]}>
            {(result.totalReturn * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.label}>Sharpe</Text>
          <Text style={styles.value}>{result.sharpeRatio.toFixed(2)}</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.label}>Max DD</Text>
          <Text style={[styles.value, { color: "#EF4444" }]}>
            {(result.maxDrawdown * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.label}>Win Rate</Text>
          <Text style={styles.value}>{(result.winRate * 100).toFixed(0)}%</Text>
        </View>
      </View>
      <Text style={styles.footer}>Backtested on historical data · Learn Quant Trading</Text>
    </View>
  );
}

export function CertificateCard({
  title,
  subtitle,
  level,
  date,
}: {
  title: string;
  subtitle: string;
  level: string;
  date: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>QUANT ACADEMY</Text>
        <Ionicons name="medal" size={22} color="#F59E0B" />
      </View>
      <Text style={styles.certLabel}>CERTIFICATE OF COMPLETION</Text>
      <Text style={styles.name}>{title}</Text>
      <Text style={styles.symbol}>{subtitle}</Text>
      <View style={styles.grid}>
        <View style={styles.cell}>
          <Text style={styles.label}>Level</Text>
          <Text style={styles.value}>{level}</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{date}</Text>
        </View>
      </View>
      <Text style={styles.footer}>Verified in-app progress · Keep building</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 340,
    backgroundColor: "#0B1220",
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { color: "#93C5FD", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  name: { color: "#fff", fontSize: 22, fontWeight: "800" },
  symbol: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  cell: { width: "47%", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 10 },
  label: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "600" },
  value: { color: "#fff", fontSize: 20, fontWeight: "800", fontFamily: "monospace" },
  footer: { color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 6 },
  certLabel: { color: "#F59E0B", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
});
