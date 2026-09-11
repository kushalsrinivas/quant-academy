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

import { SkiaHistogram, SkiaLineChart } from "@/components/charts/SkiaCharts";
import { Colors, Spacing } from "@/constants/theme";
import { getTodayKey, recordActivity } from "@/lib/db/streaks";
import { addXP, hasEarnedXPFor, XP_VALUES } from "@/lib/db/xp";
import { monteCarloSimulation, normalRandom } from "@/lib/engine/probability";

type Preset = "gbm-call" | "coin" | "dice";

const PRESETS: { id: Preset; title: string; desc: string }[] = [
  { id: "gbm-call", title: "GBM Call", desc: "European call payoff under GBM" },
  { id: "coin", title: "Coin Toss", desc: "Biased coin: heads rate converges" },
  { id: "dice", title: "Dice EV", desc: "Mean of dice rolls → 3.5" },
];

function runSimulation(
  preset: Preset,
  trialsRaw: string,
  spotRaw: string,
  strikeRaw: string,
  volRaw: string,
  daysRaw: string,
) {
  const n = Math.min(10000, Math.max(100, parseInt(trialsRaw, 10) || 1000));
  if (preset === "coin") {
    return monteCarloSimulation(n, () => (Math.random() < 0.6 ? 1 : 0));
  }
  if (preset === "dice") {
    return monteCarloSimulation(n, () => Math.floor(Math.random() * 6) + 1);
  }
  const S = parseFloat(spotRaw) || 25000;
  const K = parseFloat(strikeRaw) || 25500;
  const v = (parseFloat(volRaw) || 20) / 100;
  const T = (parseFloat(daysRaw) || 30) / 365;
  const r = 0.065;
  return monteCarloSimulation(n, () => {
    const st = S * Math.exp((r - (v * v) / 2) * T + v * Math.sqrt(T) * normalRandom());
    return Math.max(st - K, 0) * Math.exp(-r * T);
  });
}

export default function MonteCarloLab() {
  const db = useSQLiteContext();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - 48, 700);

  const [preset, setPreset] = useState<Preset>("gbm-call");
  const [trials, setTrials] = useState("2000");
  const [spot, setSpot] = useState("25000");
  const [strike, setStrike] = useState("25500");
  const [vol, setVol] = useState("20");
  const [days, setDays] = useState("30");
  const [claimed, setClaimed] = useState(false);

  const [result, setResult] = useState(() =>
    runSimulation("gbm-call", "2000", "25000", "25500", "20", "30"),
  );

  const rerun = (p: Preset, t: string, s0: string, k: string, v: string, d: string) => {
    setResult(runSimulation(p, t, s0, k, v, d));
  };

  const convergence = useMemo(() => {
    const step = Math.max(1, Math.floor(result.results.length / 80));
    const pts: number[] = [];
    let sum = 0;
    result.results.forEach((v, i) => {
      sum += v;
      if (i % step === 0) pts.push(sum / (i + 1));
    });
    return pts;
  }, [result]);

  const claimXP = async () => {
    const key = `mc:${getTodayKey()}`;
    if (await hasEarnedXPFor(db, "monte_carlo", key)) {
      setClaimed(true);
      return;
    }
    await addXP(db, XP_VALUES.monte_carlo, "monte_carlo", key);
    await recordActivity(db, { xp: XP_VALUES.monte_carlo });
    setClaimed(true);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Monte Carlo Lab</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Run thousands of random trials. Watch the mean converge — the lesson from
          Math for Quants, live.
        </Text>
      </View>

      <View style={styles.presetRow}>
        {PRESETS.map((p) => (
          <Pressable
            key={p.id}
            style={[
              styles.preset,
              {
                backgroundColor: preset === p.id ? "#8B5CF6" : colors.backgroundElement,
              },
            ]}
            onPress={() => {
              setPreset(p.id);
              rerun(p.id, trials, spot, strike, vol, days);
            }}
          >
            <Text style={[styles.presetTitle, { color: preset === p.id ? "#fff" : colors.text }]}>
              {p.title}
            </Text>
            <Text
              style={[
                styles.presetDesc,
                { color: preset === p.id ? "rgba(255,255,255,0.8)" : colors.textSecondary },
              ]}
            >
              {p.desc}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.paramRow}>
        <View style={styles.param}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Trials (≤10k)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
            value={trials}
            onChangeText={setTrials}
            keyboardType="number-pad"
          />
        </View>
        {preset === "gbm-call" && (
          <>
            <View style={styles.param}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Spot ₹</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                value={spot}
                onChangeText={setSpot}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.param}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Strike ₹</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                value={strike}
                onChangeText={setStrike}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.param}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Vol %</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                value={vol}
                onChangeText={setVol}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.param}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Days</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                value={days}
                onChangeText={setDays}
                keyboardType="number-pad"
              />
            </View>
          </>
        )}
      </View>

      <Pressable style={styles.runBtn} onPress={() => rerun(preset, trials, spot, strike, vol, days)}>
        <Text style={styles.runText}>Re-run simulation</Text>
      </Pressable>

      <View style={[styles.statCard, { backgroundColor: colors.backgroundElement }]}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Mean</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {preset === "gbm-call" ? `₹${result.mean.toFixed(2)}` : result.mean.toFixed(4)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Std dev</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{result.std.toFixed(4)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Trials</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{result.results.length}</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Distribution</Text>
      <View style={{ alignItems: "center" }}>
        <SkiaHistogram bins={result.histogram} width={chartWidth} height={170} colors={colors} color="#8B5CF6" />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Convergence of mean</Text>
      <View style={{ alignItems: "center" }}>
        <SkiaLineChart data={convergence} width={chartWidth} height={140} colors={colors} color="#10B981" />
      </View>

      <Pressable style={styles.claimBtn} onPress={claimXP}>
        <Text style={styles.runText}>
          {claimed ? "Lab XP claimed ✓" : `Complete lab · +${XP_VALUES.monte_carlo} XP`}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.four, gap: 4 },
  title: { fontSize: 24, fontWeight: "800" },
  sub: { fontSize: 13, lineHeight: 18 },
  presetRow: { flexDirection: "row", gap: 8, paddingHorizontal: Spacing.four },
  preset: { flex: 1, borderRadius: 12, padding: 10 },
  presetTitle: { fontWeight: "800", fontSize: 14 },
  presetDesc: { fontSize: 11, marginTop: 2 },
  paramRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, padding: Spacing.four },
  param: { width: "30%", gap: 4 },
  label: { fontSize: 11, fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 15, fontWeight: "600" },
  runBtn: { marginHorizontal: Spacing.four, backgroundColor: "#8B5CF6", paddingVertical: 13, borderRadius: 12, alignItems: "center" },
  runText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  statCard: { flexDirection: "row", margin: Spacing.four, borderRadius: 14, padding: Spacing.three },
  stat: { flex: 1, alignItems: "center" },
  statLabel: { fontSize: 11, fontWeight: "600" },
  statValue: { fontSize: 17, fontWeight: "800", fontFamily: "monospace", marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", paddingHorizontal: Spacing.four, marginVertical: 8 },
  claimBtn: { margin: Spacing.four, backgroundColor: "#3B82F6", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
});
