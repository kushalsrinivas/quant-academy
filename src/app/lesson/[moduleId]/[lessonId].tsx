import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { AchievementBanner } from "@/components/AchievementBanner";
import { ContentBlock } from "@/components/lessons/ContentBlock";
import { CompletionQuiz } from "@/components/lessons/CompletionQuiz";
import { LessonFooter } from "@/components/lessons/LessonFooter";
import { Colors, Spacing } from "@/constants/theme";
import { getAdjacentLessons, getLesson } from "@/lib/content/loader";
import { MODULES } from "@/lib/content/modules";
import type { Lesson, QuizSection } from "@/lib/content/types";
import {
  checkLessonAchievements,
  getAchievementDef,
  unlockAchievement,
  type AchievementDef,
} from "@/lib/db/achievements";
import { isLessonComplete, markLessonComplete } from "@/lib/db/progress";
import { getPerfectQuizCount, recordQuizResult } from "@/lib/db/quiz";
import { recordActivity } from "@/lib/db/streaks";
import { enableReminders, wasReminderAsked } from "@/lib/notifications";
import { addXP, hasEarnedXPFor, XP_VALUES } from "@/lib/db/xp";

const ORDERED_MODULE_IDS = [...MODULES].sort((a, b) => a.order - b.order).map((m) => m.id);

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
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [newUnlocks, setNewUnlocks] = useState<AchievementDef[]>([]);
  const [readProgress, setReadProgress] = useState(0);

  const quizSections = useMemo(
    () =>
      (lesson?.sections.filter((s) => s.type === "quiz") ??
        []) as QuizSection[],
    [lesson],
  );
  const hasQuiz = quizSections.length > 0;

  const adjacency = useMemo(
    () =>
      moduleId && lessonId
        ? getAdjacentLessons(moduleId, lessonId, ORDERED_MODULE_IDS)
        : { prev: null, next: null, index: 0, total: 0 },
    [moduleId, lessonId],
  );

  const moduleTitle = MODULES.find((m) => m.id === moduleId)?.title ?? "Lessons";

  const checkCompletion = useCallback(async () => {
    if (!moduleId || !lessonId) return;
    const done = await isLessonComplete(db, moduleId, lessonId);
    setCompleted(done);
  }, [db, moduleId, lessonId]);

  useFocusEffect(
    useCallback(() => {
      checkCompletion();
    }, [checkCompletion]),
  );

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const max = Math.max(1, contentSize.height - layoutMeasurement.height);
    setReadProgress(Math.min(1, Math.max(0, contentOffset.y / max)));
  }, []);

  const markComplete = useCallback(async () => {
    if (!moduleId || !lessonId || !lesson) return;
    const wasComplete = await isLessonComplete(db, moduleId, lessonId);
    await markLessonComplete(db, moduleId, lessonId);
    const alreadyEarned = await hasEarnedXPFor(
      db,
      "lesson",
      `${moduleId}/${lessonId}`,
    );
    const xpAwarded = alreadyEarned
      ? 0
      : lesson.xpReward || XP_VALUES.lesson;
    if (!alreadyEarned) {
      await addXP(db, xpAwarded, "lesson", `${moduleId}/${lessonId}`);
    }
    await recordActivity(db, {
      lessons: wasComplete ? 0 : 1,
      xp: xpAwarded,
    });
    const unlocks = await checkLessonAchievements(db, moduleId);
    setNewUnlocks(unlocks);
    setCompleted(true);
    if (
      unlocks.some((u) => u.id === "first_lesson") &&
      !(await wasReminderAsked(db))
    ) {
      Alert.alert(
        "Daily reminder?",
        "Get one evening nudge to protect your streak.",
        [
          { text: "Not now", style: "cancel" },
          {
            text: "Enable",
            onPress: async () => {
              if (!(await enableReminders(db))) {
                Alert.alert(
                  "Notifications off",
                  "Enable them in Settings to get reminders.",
                );
              }
            },
          },
        ],
      );
    }
  }, [db, moduleId, lessonId, lesson]);

  const goTo = useCallback(
    (target: { moduleId: string; lesson: Lesson } | null) => {
      if (!target) return;
      router.replace(`/lesson/${target.moduleId}/${target.lesson.id}` as never);
    },
    [router],
  );

  const handleCompletePress = useCallback(() => {
    if (hasQuiz) {
      setShowQuizModal(true);
    } else {
      markComplete();
    }
  }, [hasQuiz, markComplete]);

  const handleCompleteAndNext = useCallback(async () => {
    if (hasQuiz && !completed) {
      setShowQuizModal(true);
      return;
    }
    if (!completed) await markComplete();
    if (adjacency.next) goTo(adjacency.next);
  }, [hasQuiz, completed, markComplete, adjacency.next, goTo]);

  const handleQuizFinished = useCallback(async () => {
    setShowQuizModal(false);
    await markComplete();
    if (adjacency.next) goTo(adjacency.next);
  }, [markComplete, adjacency.next, goTo]);

  const handleQuizRecord = useCallback(
    async (score: number, total: number, answers: number[]) => {
      if (!moduleId || !lessonId) return;
      await recordQuizResult(db, {
        moduleId,
        lessonId,
        score,
        total,
        answers,
      });
      if ((await getPerfectQuizCount(db)) >= 10) {
        if (await unlockAchievement(db, "quiz_ace")) {
          const def = getAchievementDef("quiz_ace");
          if (def) setNewUnlocks((prev) => [...prev, def]);
        }
      }
    },
    [db, moduleId, lessonId],
  );

  const handleReread = useCallback(() => {
    setShowQuizModal(false);
  }, []);

  if (!lesson) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Lesson not found", headerBackTitle: "Lessons" }} />
        <Ionicons name="book-outline" size={56} color={colors.textSecondary} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          This lesson could not be found.
        </Text>
        <Pressable style={styles.completeBtn} onPress={() => router.back()}>
          <Text style={styles.completeBtnText}>Back to Lessons</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: lesson.title.length > 26 ? `${lesson.title.slice(0, 26)}…` : lesson.title,
          headerBackTitle: moduleTitle,
        }}
      />
      <View style={[styles.progressTrack]}>
        <View style={[styles.progressFill, { width: `${readProgress * 100}%` }]} />
      </View>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: 40 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: colors.textSecondary }]}>
            {moduleTitle} · Lesson {adjacency.index + 1} of {adjacency.total}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {lesson.title}
          </Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {lesson.estimatedMinutes} min · {lesson.xpReward} XP
          </Text>
        </View>

        {lesson.sections
          .filter((s) => s.type !== "quiz")
          .map((section, idx) => (
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
              onPress={handleCompletePress}
            >
              <Text style={styles.completeBtnText}>
                {hasQuiz ? "Take Quiz to Complete" : "Complete Lesson"}
              </Text>
            </Pressable>
          ) : (
            <>
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.completedText}>Completed</Text>
              </View>
              <AchievementBanner achievements={newUnlocks} />
            </>
          )}

          {hasQuiz && (
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

        <LessonFooter
          prev={adjacency.prev}
          next={adjacency.next}
          index={adjacency.index}
          total={adjacency.total}
          completed={completed}
          hasQuiz={hasQuiz}
          onPrev={() => goTo(adjacency.prev)}
          onNext={() => goTo(adjacency.next)}
          onCompleteNext={handleCompleteAndNext}
          colors={colors as Record<string, string> & typeof colors}
        />
      </ScrollView>

      <Modal
        visible={showQuizModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowQuizModal(false)}
      >
        {showQuizModal && (
          <CompletionQuiz
            questions={quizSections}
            colors={colors}
            onFinish={handleQuizFinished}
            onReread={handleReread}
            onRecord={handleQuizRecord}
          />
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressTrack: { height: 3, backgroundColor: "rgba(128,128,128,0.2)" },
  progressFill: { height: 3, backgroundColor: "#3B82F6" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.four,
    gap: Spacing.three,
  },
  errorText: { fontSize: 16, textAlign: "center" },
  header: { padding: Spacing.four, gap: Spacing.one },
  kicker: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  completedText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  quizBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  quizBtnText: { fontSize: 16, fontWeight: "600" },
});
