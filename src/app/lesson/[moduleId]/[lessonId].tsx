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

import { ContentBlock } from "@/components/lessons/ContentBlock";
import { Colors, Spacing } from "@/constants/theme";
import { getLesson } from "@/lib/content/loader";
import type { Lesson } from "@/lib/content/types";
import { unlockAchievement } from "@/lib/db/achievements";
import { isLessonComplete, markLessonComplete } from "@/lib/db/progress";
import { addXP, hasEarnedXPFor, XP_VALUES } from "@/lib/db/xp";

export default function LessonScreen() {
  const { moduleId, lessonId } = useLocalSearchParams<{
    moduleId: string;
    lessonId: string;
  }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const lesson: Lesson | null = getLesson(moduleId ?? "", lessonId ?? "");
  const [completed, setCompleted] = useState(false);

  const checkCompletion = useCallback(async () => {
    if (!moduleId || !lessonId) return;
    const done = await isLessonComplete(db, moduleId, lessonId);
    setCompleted(done);
  }, [db, moduleId, lessonId]);

  useEffect(() => {
    checkCompletion();
  }, [checkCompletion]);

  const handleComplete = useCallback(async () => {
    if (!moduleId || !lessonId || !lesson) return;
    await markLessonComplete(db, moduleId, lessonId);
    const alreadyEarned = await hasEarnedXPFor(
      db,
      "lesson",
      `${moduleId}/${lessonId}`,
    );
    if (!alreadyEarned) {
      await addXP(
        db,
        lesson.xpReward || XP_VALUES.lesson,
        "lesson",
        `${moduleId}/${lessonId}`,
      );
    }
    await unlockAchievement(db, "first_lesson");
    if (moduleId === "markets-101" && lessonId === "01-what-are-stocks") {
      await unlockAchievement(db, "first_trade");
    }
    setCompleted(true);
  }, [db, moduleId, lessonId, lesson]);

  if (!lesson) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Lesson not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {lesson.title}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {lesson.estimatedMinutes} min · {lesson.xpReward} XP
        </Text>
      </View>

      {lesson.sections.map((section, idx) => (
        <ContentBlock
          key={idx}
          section={section}
          colors={colors as Record<string, string> & typeof colors}
        />
      ))}

      <View style={styles.footer}>
        {!completed ? (
          <Pressable
            style={({ pressed }) => [
              styles.completeBtn,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleComplete}
          >
            <Text style={styles.completeBtnText}>Complete Lesson</Text>
          </Pressable>
        ) : (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ Completed</Text>
          </View>
        )}

        {lesson.sections.some((s) => s.type === "quiz") && (
          <Pressable
            style={({ pressed }) => [
              styles.quizBtn,
              {
                backgroundColor: colors.backgroundElement,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() =>
              router.push(`/quiz/${moduleId}/${lessonId}` as never)
            }
          >
            <Text style={[styles.quizBtnText, { color: colors.text }]}>
              Take Full Quiz
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16 },
  header: { padding: Spacing.four, gap: Spacing.one },
  title: { fontSize: 24, fontWeight: "700" },
  meta: { fontSize: 13 },
  footer: { padding: Spacing.four, gap: Spacing.three },
  completeBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  completeBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  completedBadge: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  completedText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  quizBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  quizBtnText: { fontSize: 16, fontWeight: "600" },
});
