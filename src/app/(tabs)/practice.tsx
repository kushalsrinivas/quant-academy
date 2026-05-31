import { useRouter } from "expo-router";
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

const CATEGORIES = [
  {
    id: "coding",
    title: "Coding",
    icon: "💻",
    description: "Arrays, hash maps, trees, graphs",
  },
  {
    id: "probability",
    title: "Probability",
    icon: "🎲",
    description: "Puzzles, expected value, conditional probability",
  },
  {
    id: "math",
    title: "Mental Math",
    icon: "🧮",
    description: "Quick arithmetic, estimation, mental tricks",
  },
  {
    id: "brainteaser",
    title: "Brain Teasers",
    icon: "🧩",
    description: "Logic puzzles and lateral thinking",
  },
  {
    id: "systems",
    title: "Systems",
    icon: "⚙️",
    description: "Networking, OS, distributed systems",
  },
] as const;

export default function PracticeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
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
                router.push(`/problem/${problems[0].id}` as never);
              }
            }}
          >
            <Text style={styles.cardIcon}>{cat.icon}</Text>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {cat.title}
              </Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                {cat.description}
              </Text>
            </View>
            <View
              style={[
                styles.countBadge,
                { backgroundColor: colors.backgroundSelected },
              ]}
            >
              <Text style={[styles.countText, { color: colors.text }]}>
                {problems.length}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  cardIcon: { fontSize: 32 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardDesc: { fontSize: 13, marginTop: 2 },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: { fontSize: 13, fontWeight: "600" },
});
