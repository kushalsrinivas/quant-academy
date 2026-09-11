import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { Colors, Spacing } from "@/constants/theme";
import { getWeakTopics, type WeakModule } from "@/lib/review/weakTopics";

export default function ReviewScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const [loading, setLoading] = useState(true);
  const [weak, setWeak] = useState<WeakModule[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setWeak(await getWeakTopics(db));
    setLoading(false);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Stack.Screen options={{ title: "Weak-Topic Review", headerBackTitle: "Learn" }} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Review weak spots</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Built from your quiz history. Fix these first — they cost the most XP in
          interviews.
        </Text>
      </View>
      {weak.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons name="checkmark-circle" size={40} color="#10B981" />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No weak topics yet</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Take more quizzes and your lowest-accuracy modules will appear here.
          </Text>
        </View>
      ) : (
        weak.map((w) => (
          <View
            key={w.moduleId}
            style={[styles.card, { backgroundColor: colors.backgroundElement }]}
          >
            <View style={styles.cardTop}>
              <View style={[styles.dot, { backgroundColor: w.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{w.title}</Text>
                <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                  {w.correct}/{w.answered} correct · {(w.accuracy * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
            {w.failedLessons.map((l) => (
              <Pressable
                key={l.lessonId}
                style={({ pressed }) => [
                  styles.lessonRow,
                  { backgroundColor: colors.backgroundSelected, opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => router.push(`/lesson/${w.moduleId}/${l.lessonId}` as never)}
              >
                <Ionicons name="refresh" size={16} color={colors.textSecondary} />
                <Text style={[styles.lessonText, { color: colors.text }]} numberOfLines={1}>
                  {l.title}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>
            ))}
            <Pressable
              style={styles.retryBtn}
              onPress={() => router.push(`/lesson/${w.moduleId}` as never)}
            >
              <Text style={styles.retryText}>Review {w.title}</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: Spacing.four, gap: 4 },
  title: { fontSize: 24, fontWeight: "800" },
  sub: { fontSize: 13, lineHeight: 18 },
  emptyCard: { margin: Spacing.four, borderRadius: 16, padding: Spacing.four, alignItems: "center", gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptySub: { fontSize: 13, textAlign: "center" },
  card: { marginHorizontal: Spacing.four, marginBottom: Spacing.three, borderRadius: 16, padding: Spacing.three, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardSub: { fontSize: 12, marginTop: 2 },
  lessonRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10 },
  lessonText: { flex: 1, fontSize: 14, fontWeight: "500" },
  retryBtn: { backgroundColor: "#3B82F6", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
