import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
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

export default function ProblemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const problem = PROBLEMS.find((p) => p.id === id);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);

  if (!problem) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Problem not found</Text>
      </View>
    );
  }

  const difficultyColor =
    problem.difficulty === "easy"
      ? "#10B981"
      : problem.difficulty === "medium"
        ? "#F59E0B"
        : "#EF4444";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
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
              if (!showHints) {
                setShowHints(true);
              } else if (hintIdx < problem.hints.length - 1) {
                setHintIdx((i) => i + 1);
              }
            }}
            disabled={showHints && hintIdx >= problem.hints.length - 1}
          >
            <Text style={[styles.hintBtnText, { color: colors.text }]}>
              {!showHints
                ? "Show Hint"
                : hintIdx < problem.hints.length - 1
                  ? "Next Hint"
                  : "All Hints Shown"}
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
        <Pressable
          style={[
            styles.solutionBtn,
            { backgroundColor: showSolution ? "#10B981" : "#3B82F6" },
          ]}
          onPress={() => setShowSolution(!showSolution)}
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
  badges: { flexDirection: "row", gap: Spacing.two },
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
  solutionBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  solutionBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  solutionBox: { padding: Spacing.three, borderRadius: 12 },
  solutionText: { fontSize: 14, lineHeight: 20, fontFamily: "monospace" },
});
