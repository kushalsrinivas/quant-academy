import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext, type SQLiteDatabase } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
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
import type { InterviewProblem } from "@/lib/content/types";
import {
  isProblemSolved,
  markProblemSolved,
  markSolutionViewed,
} from "@/lib/db/problems";
import { recordActivity } from "@/lib/db/streaks";
import { addXP, hasEarnedXPFor } from "@/lib/db/xp";

export default function ProblemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const problem = PROBLEMS.find((p) => p.id === id);

  if (!problem) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Problem not found</Text>
      </View>
    );
  }

  const siblings = PROBLEMS.filter((p) => p.category === problem.category);
  const position = siblings.findIndex((p) => p.id === problem.id);
  const prev = position > 0 ? siblings[position - 1] : undefined;
  const next =
    position >= 0 && position < siblings.length - 1
      ? siblings[position + 1]
      : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: problem.title.length > 24 ? `${problem.title.slice(0, 24)}…` : problem.title,
          headerBackTitle: "Practice",
        }}
      />
      <ProblemDetail
        key={problem.id}
        problem={problem}
        db={db}
        colors={colors}
      />
      <View
        style={[styles.navBar, { borderTopColor: colors.backgroundSelected }]}
      >
        {prev ? (
          <Pressable
            style={[styles.navBtn, { backgroundColor: colors.backgroundElement }]}
            onPress={() => router.push(`/problem/${prev.id}` as never)}
          >
            <Ionicons
              name="arrow-back"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.navBtnText, { color: colors.text }]}>
              Previous
            </Text>
          </Pressable>
        ) : (
          <View style={styles.navPlaceholder} />
        )}
        <Text style={[styles.navPosition, { color: colors.textSecondary }]}>
          {position + 1} / {siblings.length}
        </Text>
        {next ? (
          <Pressable
            style={[styles.navBtn, { backgroundColor: colors.backgroundElement }]}
            onPress={() => router.push(`/problem/${next.id}` as never)}
          >
            <Text style={[styles.navBtnText, { color: colors.text }]}>Next</Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : (
          <View style={styles.navPlaceholder} />
        )}
      </View>
    </View>
  );
}

function ProblemDetail({
  problem,
  db,
  colors,
}: {
  problem: InterviewProblem;
  db: SQLiteDatabase;
  colors: (typeof Colors)["light"] | (typeof Colors)["dark"];
}) {
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    isProblemSolved(db, problem.id).then(setSolved);
  }, [db, problem.id]);

  const handleSolve = useCallback(async () => {
    const newlySolved = await markProblemSolved(db, problem.id);
    setSolved(true);
    if (
      newlySolved &&
      !(await hasEarnedXPFor(db, "problem", problem.id))
    ) {
      await addXP(db, problem.xpReward, "problem", problem.id);
      await recordActivity(db, { xp: problem.xpReward });
    }
  }, [db, problem]);

  const handleToggleSolution = useCallback(async () => {
    if (!showSolution) {
      await markSolutionViewed(db, problem.id);
    }
    setShowSolution((s) => !s);
  }, [db, problem.id, showSolution]);

  const difficultyColor =
    problem.difficulty === "easy"
      ? "#10B981"
      : problem.difficulty === "medium"
        ? "#F59E0B"
        : "#EF4444";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View style={styles.header}>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: difficultyColor }]}>
            <Text style={styles.badgeText}>{problem.difficulty}</Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {problem.category}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {problem.xpReward} XP
            </Text>
          </View>
          {solved && (
            <View style={[styles.badge, { backgroundColor: "#10B981" }]}>
              <Text style={styles.badgeText}>Solved</Text>
            </View>
          )}
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {problem.title}
        </Text>
      </View>

      <View
        style={[styles.descBox, { backgroundColor: colors.backgroundElement }]}
      >
        <Text style={[styles.description, { color: colors.text }]}>
          {problem.description}
        </Text>
      </View>

      {problem.hints.length > 0 && (
        <View style={styles.section}>
          <Pressable
            style={[
              styles.hintBtn,
              { backgroundColor: colors.backgroundElement },
            ]}
            onPress={() => {
              setShowHints(true);
              if (hintIdx < problem.hints.length - 1) setHintIdx((i) => i + 1);
            }}
          >
            <Text style={[styles.hintBtnText, { color: colors.text }]}>
              {showHints ? "Next Hint" : "Show Hint"}
            </Text>
          </Pressable>
          {showHints &&
            problem.hints.slice(0, hintIdx + 1).map((hint, i) => (
              <View
                key={i}
                style={[
                  styles.hintCard,
                  { backgroundColor: colors.backgroundElement },
                ]}
              >
                <Text
                  style={[styles.hintLabel, { color: colors.textSecondary }]}
                >
                  Hint {i + 1}
                </Text>
                <Text style={[styles.hintText, { color: colors.text }]}>
                  {hint}
                </Text>
              </View>
            ))}
        </View>
      )}

      <View style={styles.section}>
        {!solved ? (
          <Pressable style={styles.solveBtn} onPress={handleSolve}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.solutionBtnText}>Mark as Solved</Text>
          </Pressable>
        ) : (
          <View style={styles.solvedBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.solutionBtnText}>Solved</Text>
          </View>
        )}
        <Pressable
          style={[
            styles.solutionBtn,
            { backgroundColor: showSolution ? "#10B981" : "#3B82F6" },
          ]}
          onPress={handleToggleSolution}
        >
          <Text style={styles.solutionBtnText}>
            {showSolution ? "Hide Solution" : "Show Solution"}
          </Text>
        </Pressable>
        {showSolution && (
          <View
            style={[
              styles.solutionBox,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <Text style={[styles.solutionText, { color: colors.text }]}>
              {problem.solution}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: Spacing.four, gap: Spacing.two },
  badges: { flexDirection: "row", gap: Spacing.two, flexWrap: "wrap" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  title: { fontSize: 22, fontWeight: "700" },
  descBox: {
    marginHorizontal: Spacing.four,
    padding: Spacing.three,
    borderRadius: 12,
  },
  description: { fontSize: 15, lineHeight: 22 },
  section: { padding: Spacing.four, gap: Spacing.two },
  hintBtn: { padding: Spacing.three, borderRadius: 12, alignItems: "center" },
  hintBtnText: { fontSize: 15, fontWeight: "600" },
  hintCard: { padding: Spacing.three, borderRadius: 10 },
  hintLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  hintText: { fontSize: 14, lineHeight: 20 },
  solveBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  solvedBadge: {
    backgroundColor: "#10B981",
    opacity: 0.75,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  solutionBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  solutionBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  solutionBox: { padding: Spacing.three, borderRadius: 12 },
  solutionText: { fontSize: 14, lineHeight: 20, fontFamily: "monospace" },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderTopWidth: 1,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  navBtnText: { fontSize: 14, fontWeight: "600" },
  navPosition: { fontSize: 12, fontWeight: "500" },
  navPlaceholder: { width: 110 },
});
