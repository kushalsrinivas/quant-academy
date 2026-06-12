import { useCallback, useRef, useState } from "react";
import {
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { Colors, Spacing } from "@/constants/theme";

export default function CoinTossScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const [heads, setHeads] = useState(0);
  const [tails, setTails] = useState(0);
  const [bias, setBias] = useState(0.5);
  const [lastFlip, setLastFlip] = useState<"H" | "T" | null>(null);
  const [history, setHistory] = useState<boolean[]>([]);
  const [flipping, setFlipping] = useState(false);

  const headsRef = useRef(heads);
  const tailsRef = useRef(tails);
  const historyRef = useRef(history);
  headsRef.current = heads;
  tailsRef.current = tails;
  historyRef.current = history;

  const total = heads + tails;
  const headsRatio = total > 0 ? heads / total : 0;
  const tailsRatio = total > 0 ? tails / total : 0;

  const flip = useCallback(
    (count: number) => {
      if (count <= 1000) {
        let h = headsRef.current;
        let t = tailsRef.current;
        const newHistory = [...historyRef.current];
        let last: "H" | "T" = "H";
        for (let i = 0; i < count; i++) {
          const isHeads = Math.random() < bias;
          if (isHeads) {
            h++;
            last = "H";
          } else {
            t++;
            last = "T";
          }
          if (count <= 10) newHistory.push(isHeads);
        }
        setHeads(h);
        setTails(t);
        setLastFlip(last);
        setHistory(newHistory.slice(-100));
      } else {
        setFlipping(true);
        InteractionManager.runAfterInteractions(() => {
          let h = headsRef.current;
          let t = tailsRef.current;
          let last: "H" | "T" = "H";
          for (let i = 0; i < count; i++) {
            if (Math.random() < bias) {
              h++;
              last = "H";
            } else {
              t++;
              last = "T";
            }
          }
          setHeads(h);
          setTails(t);
          setLastFlip(last);
          setFlipping(false);
        });
      }
    },
    [bias],
  );

  const reset = useCallback(() => {
    setHeads(0);
    setTails(0);
    setLastFlip(null);
    setHistory([]);
  }, []);

  const biasSteps = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Coin Display */}
      <View style={styles.coinArea}>
        <View
          style={[
            styles.coin,
            {
              backgroundColor:
                lastFlip === "H"
                  ? "#F59E0B"
                  : lastFlip === "T"
                    ? "#94A3B8"
                    : colors.backgroundElement,
            },
          ]}
        >
          <Text style={styles.coinText}>{lastFlip ?? "?"}</Text>
        </View>
      </View>

      {/* Flip Buttons */}
      <View style={styles.flipRow}>
        <Pressable
          style={[styles.flipBtn, { backgroundColor: "#3B82F6" }]}
          onPress={() => flip(1)}
        >
          <Text style={styles.flipBtnText}>FLIP 1</Text>
        </Pressable>
        <Pressable
          style={[styles.flipBtn, { backgroundColor: "#6366F1" }]}
          onPress={() => flip(100)}
        >
          <Text style={styles.flipBtnText}>× 100</Text>
        </Pressable>
        <Pressable
          style={[styles.flipBtn, { backgroundColor: "#8B5CF6" }]}
          onPress={() => flip(1000)}
        >
          <Text style={styles.flipBtnText}>× 1K</Text>
        </Pressable>
        <Pressable
          style={[
            styles.flipBtn,
            { backgroundColor: "#A855F7", opacity: flipping ? 0.5 : 1 },
          ]}
          onPress={() => flip(10000)}
          disabled={flipping}
        >
          <Text style={styles.flipBtnText}>{flipping ? "..." : "× 10K"}</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View
        style={[
          styles.statsCard,
          { backgroundColor: colors.backgroundElement },
        ]}
      >
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Flips
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {total.toLocaleString()}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: "#F59E0B" }]}>Heads</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {heads.toLocaleString()} ({(headsRatio * 100).toFixed(1)}%)
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: "#94A3B8" }]}>Tails</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {tails.toLocaleString()} ({(tailsRatio * 100).toFixed(1)}%)
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Expected (bias)
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {(bias * 100).toFixed(0)}% heads
          </Text>
        </View>
      </View>

      {/* Distribution Bar */}
      <View style={styles.distSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Distribution
        </Text>
        <View style={styles.distBar}>
          <View style={[styles.distHeads, { flex: headsRatio || 0.001 }]} />
          <View style={[styles.distTails, { flex: tailsRatio || 0.001 }]} />
        </View>
        <View style={styles.distLabels}>
          <Text style={{ color: "#F59E0B", fontSize: 12 }}>
            Heads {(headsRatio * 100).toFixed(1)}%
          </Text>
          <Text style={{ color: "#94A3B8", fontSize: 12 }}>
            Tails {(tailsRatio * 100).toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Convergence */}
      {total > 10 && (
        <View
          style={[
            styles.convergence,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Convergence
          </Text>
          <Text
            style={[styles.convergenceText, { color: colors.textSecondary }]}
          >
            Deviation from expected: {Math.abs(headsRatio - bias).toFixed(4)}
          </Text>
          <Text
            style={[styles.convergenceText, { color: colors.textSecondary }]}
          >
            As N → ∞, ratio → {bias.toFixed(2)} (Law of Large Numbers)
          </Text>
        </View>
      )}

      {/* Bias Selector */}
      <View style={styles.biasSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Coin Bias
        </Text>
        <View style={styles.biasRow}>
          {biasSteps.map((b) => (
            <Pressable
              key={b}
              style={[
                styles.biasBtn,
                {
                  backgroundColor:
                    bias === b ? "#3B82F6" : colors.backgroundElement,
                },
              ]}
              onPress={() => {
                setBias(b);
                reset();
              }}
            >
              <Text
                style={[
                  styles.biasBtnText,
                  { color: bias === b ? "#fff" : colors.text },
                ]}
              >
                {(b * 100).toFixed(0)}%
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Recent History */}
      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Last {Math.min(history.length, 50)} Flips
          </Text>
          <View style={styles.historyGrid}>
            {history.slice(-50).map((h, i) => (
              <View
                key={i}
                style={[
                  styles.historyDot,
                  { backgroundColor: h ? "#F59E0B" : "#94A3B8" },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      <Pressable
        style={[styles.resetBtn, { backgroundColor: colors.backgroundElement }]}
        onPress={reset}
      >
        <Text style={[styles.resetBtnText, { color: colors.text }]}>Reset</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  coinArea: { alignItems: "center", paddingVertical: Spacing.four },
  coin: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  coinText: { fontSize: 36, fontWeight: "800" },
  flipRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    justifyContent: "center",
  },
  flipBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  flipBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  statsCard: {
    margin: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    gap: Spacing.two,
  },
  statRow: { flexDirection: "row", justifyContent: "space-between" },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 14, fontWeight: "600", fontFamily: "monospace" },
  distSection: { marginHorizontal: Spacing.three, marginTop: Spacing.two },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: Spacing.two },
  distBar: {
    flexDirection: "row",
    height: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  distHeads: { backgroundColor: "#F59E0B" },
  distTails: { backgroundColor: "#94A3B8" },
  distLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  convergence: {
    margin: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
  },
  convergenceText: { fontSize: 13, marginTop: 4 },
  biasSection: { marginHorizontal: Spacing.three, marginTop: Spacing.three },
  biasRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  biasBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  biasBtnText: { fontSize: 12, fontWeight: "600" },
  historySection: { marginHorizontal: Spacing.three, marginTop: Spacing.three },
  historyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  historyDot: { width: 12, height: 12, borderRadius: 6 },
  resetBtn: {
    margin: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    alignItems: "center",
  },
  resetBtnText: { fontSize: 14, fontWeight: "600" },
});
