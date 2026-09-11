import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { Colors, Spacing } from "@/constants/theme";
import { DISCORD_INVITE_URL, currentWeekId, weeklyChallenge } from "@/lib/challenge/weekly";
import { getSolvedProblemIds } from "@/lib/db/problems";
import { recordWeeklyProgress } from "@/lib/db/weekly";
import { recordActivity } from "@/lib/db/streaks";
import { addXP, hasEarnedXPFor, XP_VALUES } from "@/lib/db/xp";

export default function ChallengeScreen() {
  const { weekId } = useLocalSearchParams<{ weekId: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const id = weekId ?? currentWeekId();
  const challenge = weeklyChallenge(id);
  const [solved, setSolved] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setSolved(await getSolvedProblemIds(db));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const solvedCount = challenge.problems.filter((p) => solved.has(p.id)).length;

  const claim = async () => {
    await recordWeeklyProgress(db, id, solvedCount, challenge.problems.length);
    if (solvedCount >= challenge.problems.length) {
      const key = `weekly:${id}`;
      if (!(await hasEarnedXPFor(db, "weekly_complete", key))) {
        await addXP(db, XP_VALUES.weekly_complete, "weekly_complete", key);
        await recordActivity(db, { xp: XP_VALUES.weekly_complete });
        Alert.alert("Challenge complete!", `+${XP_VALUES.weekly_complete} XP. Share it in Discord.`);
      }
    } else {
      Alert.alert("Not yet", `Solve ${challenge.problems.length - solvedCount} more to claim.`);
    }
  };

  const openDiscord = async () => {
    await db.runAsync(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('discord_joined', '1')",
    );
    await WebBrowser.openBrowserAsync(DISCORD_INVITE_URL);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Stack.Screen options={{ title: `Challenge ${id}`, headerBackTitle: "Learn" }} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{challenge.title}</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          {solvedCount}/{challenge.problems.length} solved · New challenge every Monday (IST)
        </Text>
      </View>
      {challenge.problems.map((p, i) => {
        const done = solved.has(p.id);
        return (
          <Pressable
            key={p.id}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: colors.backgroundElement, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => router.push(`/problem/${p.id}` as never)}
          >
            <View style={[styles.num, { backgroundColor: done ? "#10B981" : colors.backgroundSelected }]}>
              {done ? (
                <Ionicons name="checkmark" size={16} color="#fff" />
              ) : (
                <Text style={[styles.numText, { color: colors.textSecondary }]}>{i + 1}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{p.title}</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                {p.category} · {p.difficulty} · {p.xpReward} XP
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>
        );
      })}
      <View style={[styles.promptCard, { backgroundColor: colors.backgroundElement }]}>
        <Text style={[styles.promptTitle, { color: colors.text }]}>Backtest bonus</Text>
        <Text style={[styles.promptText, { color: colors.textSecondary }]}>
          {challenge.backtestPrompt}
        </Text>
      </View>
      <Pressable style={styles.claimBtn} onPress={claim}>
        <Text style={styles.claimText}>Claim weekly XP</Text>
      </Pressable>
      <Pressable style={[styles.discordBtn, { backgroundColor: "#5865F2" }]} onPress={openDiscord}>
        <Ionicons name="chatbubbles" size={18} color="#fff" />
        <Text style={styles.claimText}>Discuss in Discord</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.four, gap: 4 },
  title: { fontSize: 24, fontWeight: "800" },
  sub: { fontSize: 13 },
  row: { marginHorizontal: Spacing.four, marginBottom: 8, borderRadius: 12, padding: Spacing.three, flexDirection: "row", alignItems: "center", gap: 12 },
  num: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  numText: { fontWeight: "800", fontSize: 14 },
  rowTitle: { fontSize: 15, fontWeight: "700" },
  rowSub: { fontSize: 12, marginTop: 2, textTransform: "capitalize" },
  promptCard: { margin: Spacing.four, borderRadius: 14, padding: Spacing.three, gap: 6 },
  promptTitle: { fontSize: 15, fontWeight: "700" },
  promptText: { fontSize: 13, lineHeight: 19 },
  claimBtn: { marginHorizontal: Spacing.four, marginBottom: 8, backgroundColor: "#3B82F6", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  claimText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  discordBtn: { marginHorizontal: Spacing.four, paddingVertical: 14, borderRadius: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
});
