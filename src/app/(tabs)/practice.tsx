import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Spacing } from "@/constants/theme";
import { PROBLEMS } from "@/data/problems/registry";
import { getSolvedProblemIds } from "@/lib/db/problems";

const CATEGORIES = [
  {
    id: "coding",
    title: "Coding",
    iconName: "code-slash-outline" as const,
    iconColor: "#3B82F6",
    description: "Arrays, hash maps, trees, graphs",
  },
  {
    id: "probability",
    title: "Probability",
    iconName: "dice-outline" as const,
    iconColor: "#8B5CF6",
    description: "Puzzles, expected value, conditional probability",
  },
  {
    id: "math",
    title: "Mental Math",
    iconName: "calculator-outline" as const,
    iconColor: "#F59E0B",
    description: "Quick arithmetic, estimation, mental tricks",
  },
  {
    id: "brainteaser",
    title: "Brain Teasers",
    iconName: "bulb-outline" as const,
    iconColor: "#EC4899",
    description: "Logic puzzles and lateral thinking",
  },
  {
    id: "systems",
    title: "Systems",
    iconName: "settings-outline" as const,
    iconColor: "#06B6D4",
    description: "Networking, OS, distributed systems",
  },
] as const;

export default function PracticeScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.four,
          paddingBottom: 100,
        }}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Interview Prep
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Practice what HRT, Jane Street, and Citadel actually ask.
          </Text>
        </View>

        {CATEGORIES.map((cat) => {
          const problems = PROBLEMS.filter((p) => p.category === cat.id);
          const solvedCount = problems.filter((p) =>
            solvedIds.has(p.id),
          ).length;
          return (
            <Pressable
              key={cat.id}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.backgroundElement,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => {
                if (problems.length > 0) {
                  router.push(`/practice/${cat.id}` as never);
                }
              }}
            >
              <View
                style={[
                  styles.cardIconWrap,
                  { backgroundColor: cat.iconColor + "18" },
                ]}
              >
                <Ionicons name={cat.iconName} size={22} color={cat.iconColor} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {cat.title}
                </Text>
                <Text
                  style={[styles.cardDesc, { color: colors.textSecondary }]}
                >
                  {cat.description}
                </Text>
              </View>
              <View style={styles.cardRight}>
                <View
                  style={[
                    styles.countBadge,
                    { backgroundColor: colors.backgroundSelected },
                  ]}
                >
                  <Text style={[styles.countText, { color: colors.text }]}>
                    {solvedCount}/{problems.length}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textSecondary}
                />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: { paddingHorizontal: Spacing.four, marginBottom: Spacing.four },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 14, marginTop: Spacing.one },
  card: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    borderRadius: 16,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardDesc: { fontSize: 13, marginTop: 2 },
  cardRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: { fontSize: 13, fontWeight: "600" },
});
