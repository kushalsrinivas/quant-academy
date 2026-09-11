import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import { SkiaLineChart } from "@/components/charts/SkiaCharts";
import { Colors, Spacing } from "@/constants/theme";
import {
  blackScholesGreeks,
  blackScholesPrice,
  payoffSeries,
  type OptionType,
} from "@/lib/engine/options";
import { getTodayKey, recordActivity } from "@/lib/db/streaks";
import { addXP, hasEarnedXPFor, XP_VALUES } from "@/lib/db/xp";

function NumField({
  label,
  value,
  onChange,
  colors,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  colors: Record<string, string>;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { color: colors.text, borderColor: colors.backgroundSelected },
        ]}
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
      />
    </View>
  );
}

export default function OptionsPlayground() {
  const db = useSQLiteContext();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - 48, 700);

  const [type, setType] = useState<OptionType>("call");
  const [spot, setSpot] = useState("25000");
  const [strike, setStrike] = useState("25000");
  const [days, setDays] = useState("30");
  const [rate, setRate] = useState("6.5");
  const [vol, setVol] = useState("20");
  const [claimed, setClaimed] = useState(false);

  const inputs = useMemo(() => {
    const S = parseFloat(spot) || 0;
    const K = parseFloat(strike) || 0;
    const T = Math.max(1, parseFloat(days) || 30) / 365;
    const r = (parseFloat(rate) || 0) / 100;
    const v = Math.max(1, parseFloat(vol) || 20) / 100;
    return { spot: S, strike: K, timeYears: T, rate: r, vol: v, type };
  }, [spot, strike, days, rate, vol, type]);

  const price = useMemo(() => blackScholesPrice(inputs), [inputs]);
  const greeks = useMemo(() => blackScholesGreeks(inputs), [inputs]);
  const payoff = useMemo(() => {
    const K = inputs.strike;
    const spots: number[] = [];
    for (let i = 0; i <= 60; i++) spots.push(K * (0.7 + (0.6 * i) / 60));
    return { spots, values: payoffSeries(type, K, price, spots) };
  }, [inputs, price, type]);

  const claimXP = async () => {
    const key = `options:${getTodayKey()}`;
    if (await hasEarnedXPFor(db, "options_lab", key)) {
      setClaimed(true);
      return;
    }
    await addXP(db, XP_VALUES.options_lab, "options_lab", key);
    await recordActivity(db, { xp: XP_VALUES.options_lab });
    setClaimed(true);
  };

  const greekCards = [
    { label: "Delta", value: greeks.delta.toFixed(3) },
    { label: "Gamma", value: greeks.gamma.toFixed(5) },
    { label: "Theta /day", value: greeks.theta.toFixed(2) },
    { label: "Vega /1%", value: greeks.vega.toFixed(2) },
    { label: "Rho /1%", value: greeks.rho.toFixed(2) },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Options Playground</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Black-Scholes price + Greeks. NIFTY-style defaults (₹, 30 days).
        </Text>
      </View>

      <View style={styles.typeRow}>
        {(["call", "put"] as OptionType[]).map((t) => (
          <Pressable
            key={t}
            style={[
              styles.typeBtn,
              {
                backgroundColor:
                  type === t ? "#3B82F6" : colors.backgroundElement,
              },
            ]}
            onPress={() => setType(t)}
          >
            <Text
              style={[
                styles.typeText,
                { color: type === t ? "#fff" : colors.text },
              ]}
            >
              {t.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.grid}>
        <NumField label="Spot (₹)" value={spot} onChange={setSpot} colors={colors} />
        <NumField label="Strike (₹)" value={strike} onChange={setStrike} colors={colors} />
        <NumField label="Days to expiry" value={days} onChange={setDays} colors={colors} />
        <NumField label="Rate % (risk-free)" value={rate} onChange={setRate} colors={colors} />
        <NumField label="Vol % (IV)" value={vol} onChange={setVol} colors={colors} />
      </View>

      <View style={[styles.priceCard, { backgroundColor: colors.backgroundElement }]}>
        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
          Theoretical {type.toUpperCase()} premium
        </Text>
        <Text style={[styles.priceValue, { color: colors.text }]}>
          ₹{price.toFixed(2)}
        </Text>
      </View>

      <View style={styles.greekGrid}>
        {greekCards.map((g) => (
          <View
            key={g.label}
            style={[styles.greekCard, { backgroundColor: colors.backgroundElement }]}
          >
            <Text style={[styles.greekLabel, { color: colors.textSecondary }]}>
              {g.label}
            </Text>
            <Text style={[styles.greekValue, { color: colors.text }]}>{g.value}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Payoff at expiry</Text>
      <View style={{ alignItems: "center" }}>
        <SkiaLineChart
          data={payoff.values}
          width={chartWidth}
          height={180}
          color={type === "call" ? "#10B981" : "#8B5CF6"}
          colors={colors}
        />
        <Text style={[styles.axisNote, { color: colors.textSecondary }]}>
          Spot {payoff.spots[0]!.toFixed(0)} → {payoff.spots[payoff.spots.length - 1]!.toFixed(0)} · Strike {inputs.strike.toFixed(0)}
        </Text>
      </View>

      <Pressable style={styles.claimBtn} onPress={claimXP}>
        <Text style={styles.claimText}>
          {claimed ? "Lab XP claimed ✓" : `Complete lab · +${XP_VALUES.options_lab} XP`}
        </Text>
      </Pressable>
      <Text style={[styles.note, { color: colors.textSecondary }]}>
        Educational model — not investment advice. Uses Black-Scholes with constant vol.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.four, gap: 4 },
  title: { fontSize: 24, fontWeight: "800" },
  sub: { fontSize: 13, lineHeight: 18 },
  typeRow: { flexDirection: "row", gap: 8, paddingHorizontal: Spacing.four },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  typeText: { fontWeight: "800", fontSize: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, padding: Spacing.four },
  field: { width: "31%", gap: 4 },
  fieldLabel: { fontSize: 11, fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 15, fontWeight: "600" },
  priceCard: { marginHorizontal: Spacing.four, borderRadius: 14, padding: Spacing.three, alignItems: "center" },
  priceLabel: { fontSize: 12, fontWeight: "600" },
  priceValue: { fontSize: 34, fontWeight: "800", fontFamily: "monospace" },
  greekGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, padding: Spacing.four },
  greekCard: { width: "31%", borderRadius: 12, padding: 10 },
  greekLabel: { fontSize: 11, fontWeight: "600" },
  greekValue: { fontSize: 16, fontWeight: "700", fontFamily: "monospace", marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", paddingHorizontal: Spacing.four, marginBottom: 8 },
  axisNote: { fontSize: 11, marginTop: 6 },
  claimBtn: { margin: Spacing.four, backgroundColor: "#3B82F6", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  claimText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  note: { fontSize: 12, textAlign: "center", paddingHorizontal: Spacing.four },
});
