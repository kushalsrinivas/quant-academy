import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

const CATEGORY_TITLES: Record<string, string> = {
  coding: "Coding",
  probability: "Probability",
  math: "Mental Math",
  brainteaser: "Brain Teasers",
  systems: "Systems",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#10B981",
  medium: "#F59E0B",
  hard: "#EF4444",
};

export default function ProblemListScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const problems = PROBLEMS.filter((p) => p.category === category);
  const title = CATEGORY_TITLES[category ?? ""] ?? category;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {problems.length} problems
        </Text>
      </View>

      {problems.map((problem) => (
        <Pressable
          key={problem.id}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: colors.backgroundElement,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={() => router.push(`/problem/${problem.id}` as never)}
          accessibilityRole="button"
          accessibilityLabel={`${problem.title}, ${problem.difficulty} difficulty`}
        >
          <View style={styles.cardLeft}>
            <Text style={[styles.problemTitle, { color: colors.text }]}>
              {problem.title}
            </Text>
            <View style={styles.badges}>
              <View
                style={[
                  styles.diffBadge,
                  {
                    backgroundColor:
                      DIFFICULTY_COLORS[problem.difficulty] ?? "#888",
                  },
                ]}
              >
                <Text style={styles.diffText}>{problem.difficulty}</Text>
              </View>
              <Text style={[styles.xpLabel, { color: colors.textSecondary }]}>
                {problem.xpReward} XP
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: Spacing.four,
    gap: Spacing.one,
  },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 14 },
  card: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    borderRadius: 12,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  cardLeft: { flex: 1, gap: 6 },
  problemTitle: { fontSize: 15, fontWeight: "600" },
  badges: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  xpLabel: { fontSize: 12 },
});
