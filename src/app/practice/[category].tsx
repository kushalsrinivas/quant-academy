import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { Colors, Spacing } from "@/constants/theme";
import { PROBLEMS } from "@/data/problems/registry";
import { getSolvedProblemIds } from "@/lib/db/problems";

const CATEGORY_TITLES: Record<string, string> = {
  coding: "Coding",
  probability: "Probability",
  math: "Mental Math",
  brainteaser: "Brain Teasers",
  systems: "Systems",
};

function difficultyColor(difficulty: string): string {
  if (difficulty === "easy") return "#10B981";
  if (difficulty === "medium") return "#F59E0B";
  return "#EF4444";
}

export default function ProblemListScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const loadSolved = useCallback(async () => {
    setSolvedIds(await getSolvedProblemIds(db));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadSolved();
    }, [loadSolved]),
  );

  const problems = PROBLEMS.filter((p) => p.category === category);
  const solvedCount = problems.filter((p) => solvedIds.has(p.id)).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Stack.Screen
        options={{
          title: CATEGORY_TITLES[category ?? ""] ?? "Practice",
          headerBackTitle: "Practice",
        }}
      />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {CATEGORY_TITLES[category ?? ""] ?? category}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {solvedCount}/{problems.length} solved
        </Text>
      </View>

      {problems.map((problem, idx) => {
        const solved = solvedIds.has(problem.id);
        return (
          <Pressable
            key={problem.id}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: colors.backgroundElement,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => router.push(`/problem/${problem.id}` as never)}
          >
            <View
              style={[
                styles.numberBadge,
                {
                  backgroundColor: solved
                    ? "#10B981"
                    : colors.backgroundSelected,
                },
              ]}
            >
              {solved ? (
                <Ionicons name="checkmark" size={16} color="#fff" />
              ) : (
                <Text
                  style={[styles.numberText, { color: colors.textSecondary }]}
                >
                  {idx + 1}
                </Text>
              )}
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {problem.title}
              </Text>
              <Text
                style={[styles.rowMeta, { color: colors.textSecondary }]}
              >
                {problem.xpReward} XP
              </Text>
            </View>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: difficultyColor(problem.difficulty) },
              ]}
            >
              <Text style={styles.difficultyText}>{problem.difficulty}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textSecondary}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.four, gap: Spacing.one },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 13 },
  row: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    borderRadius: 12,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: { fontWeight: "700", fontSize: 14 },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "600" },
  rowMeta: { fontSize: 12, marginTop: 2 },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
