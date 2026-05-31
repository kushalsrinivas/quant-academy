import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
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
import { getLessonsForModule } from "@/lib/content/loader";
import { MODULES } from "@/lib/content/modules";
import type { Lesson } from "@/lib/content/types";
import { getCompletedLessons } from "@/lib/db/progress";

export default function LessonListScreen() {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const mod = MODULES.find((m) => m.id === moduleId);
  const lessons: Lesson[] = getLessonsForModule(moduleId ?? "");
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const loadProgress = useCallback(async () => {
    if (!moduleId) return;
    const ids = await getCompletedLessons(db, moduleId);
    setCompletedIds(ids);
  }, [db, moduleId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerIcon}>{mod?.icon}</Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {mod?.title ?? moduleId}
        </Text>
        <Text style={[styles.headerDesc, { color: colors.textSecondary }]}>
          {mod?.description}
        </Text>
        <Text style={[styles.headerProgress, { color: colors.textSecondary }]}>
          {completedIds.length}/{lessons.length} lessons completed
        </Text>
      </View>

      {lessons.map((lesson, idx) => {
        const isCompleted = completedIds.includes(lesson.id);
        return (
          <Pressable
            key={lesson.id}
            style={({ pressed }) => [
              styles.lessonRow,
              {
                backgroundColor: colors.backgroundElement,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() =>
              router.push(`/lesson/${moduleId}/${lesson.id}` as never)
            }
          >
            <View
              style={[
                styles.lessonNumber,
                {
                  backgroundColor: isCompleted
                    ? (mod?.color ?? "#3B82F6")
                    : colors.backgroundSelected,
                },
              ]}
            >
              <Text
                style={[
                  styles.lessonNumberText,
                  { color: isCompleted ? "#fff" : colors.textSecondary },
                ]}
              >
                {isCompleted ? "✓" : idx + 1}
              </Text>
            </View>
            <View style={styles.lessonContent}>
              <Text style={[styles.lessonTitle, { color: colors.text }]}>
                {lesson.title}
              </Text>
              <Text
                style={[styles.lessonMeta, { color: colors.textSecondary }]}
              >
                {lesson.estimatedMinutes} min · {lesson.xpReward} XP
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
  header: {
    padding: Spacing.four,
    alignItems: "center",
    gap: Spacing.one,
  },
  headerIcon: { fontSize: 48 },
  headerTitle: { fontSize: 24, fontWeight: "700", marginTop: Spacing.two },
  headerDesc: { fontSize: 14, textAlign: "center" },
  headerProgress: { fontSize: 13, marginTop: Spacing.two },
  lessonRow: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    borderRadius: 12,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  lessonNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonNumberText: { fontWeight: "700", fontSize: 14 },
  lessonContent: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: "600" },
  lessonMeta: { fontSize: 12, marginTop: 2 },
});
