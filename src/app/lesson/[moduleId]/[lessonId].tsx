import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { ContentBlock } from "@/components/lessons/ContentBlock";
import { Colors, Spacing } from "@/constants/theme";
import { getLesson, getLessonsForModule } from "@/lib/content/loader";
import { MODULES } from "@/lib/content/modules";
import type { Lesson, QuizSection } from "@/lib/content/types";
import { unlockAchievement } from "@/lib/db/achievements";
import {
  getCompletedLessons,
  isLessonComplete,
  markLessonComplete,
} from "@/lib/db/progress";
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
  const [showQuizModal, setShowQuizModal] = useState(false);

  const quizSections = useMemo(
    () =>
      (lesson?.sections.filter((s) => s.type === "quiz") ??
        []) as QuizSection[],
    [lesson],
  );
  const hasQuiz = quizSections.length > 0;

  const checkCompletion = useCallback(async () => {
    if (!moduleId || !lessonId) return;
    const done = await isLessonComplete(db, moduleId, lessonId);
    setCompleted(done);
  }, [db, moduleId, lessonId]);

  useEffect(() => {
    checkCompletion();
  }, [checkCompletion]);

  const allLessons = useMemo(
    () => getLessonsForModule(moduleId ?? ""),
    [moduleId],
  );
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = currentIndex >= 0 ? allLessons[currentIndex + 1] : null;

  const markComplete = useCallback(async () => {
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

    const completedIds = await getCompletedLessons(db, moduleId);
    const completedSet = new Set(completedIds);
    completedSet.add(lessonId);
    const moduleLessons = getLessonsForModule(moduleId);
    const allDone = moduleLessons.every((l) => completedSet.has(l.id));

    if (allDone) {
      const moduleAchievementMap: Record<string, string> = {
        probability: "prob_master",
        statistics: "stat_wizard",
        "market-microstructure": "microstructure",
        "math-for-quants": "math_complete",
        "interview-prep": "interview_ready",
      };
      const achId = moduleAchievementMap[moduleId];
      if (achId) await unlockAchievement(db, achId);

      const allModulesDone = await Promise.all(
        MODULES.map(async (m) => {
          const ids = await getCompletedLessons(db, m.id);
          return getLessonsForModule(m.id).every((l) => ids.includes(l.id));
        }),
      );
      if (allModulesDone.every(Boolean)) {
        await unlockAchievement(db, "full_stack");
      }
    }

    setCompleted(true);
  }, [db, moduleId, lessonId, lesson]);

  const handleCompletePress = useCallback(() => {
    if (hasQuiz) {
      setShowQuizModal(true);
    } else {
      markComplete();
    }
  }, [hasQuiz, markComplete]);

  const handleQuizFinished = useCallback(async () => {
    setShowQuizModal(false);
    await markComplete();
  }, [markComplete]);

  const handleSkipQuiz = useCallback(async () => {
    setShowQuizModal(false);
    await markComplete();
  }, [markComplete]);

  const handleReread = useCallback(() => {
    setShowQuizModal(false);
  }, []);

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
    <>
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
              <Text style={styles.completeBtnText}>Complete Lesson</Text>
            </Pressable>
          ) : (
            <>
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✓ Completed</Text>
              </View>
              {nextLesson && (
                <Pressable
                  style={({ pressed }) => [
                    styles.nextLessonBtn,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                  onPress={() =>
                    router.replace(
                      `/lesson/${moduleId}/${nextLesson.id}` as never,
                    )
                  }
                >
                  <Text style={styles.nextLessonText}>
                    Next: {nextLesson.title} →
                  </Text>
                </Pressable>
              )}
            </>
          )}

          {hasQuiz && !completed && (
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

      <Modal
        visible={showQuizModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowQuizModal(false)}
      >
        <CompletionQuiz
          questions={quizSections}
          colors={colors}
          onFinish={handleQuizFinished}
          onSkip={handleSkipQuiz}
          onReread={handleReread}
        />
      </Modal>
    </>
  );
}

function CompletionQuiz({
  questions,
  colors,
  onFinish,
  onSkip,
  onReread,
}: {
  questions: QuizSection[];
  colors: (typeof Colors)["light"];
  onFinish: () => void;
  onSkip: () => void;
  onReread: () => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[currentIdx];

  const handleSelect = useCallback(
    (idx: number) => {
      if (showResult) return;
      setSelected(idx);
      setShowResult(true);
      if (idx === current?.correct) {
        setCorrectCount((c) => c + 1);
      }
    },
    [showResult, current],
  );

  const handleNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  }, [currentIdx, questions.length]);

  if (finished) {
    const total = questions.length;
    const passed = correctCount >= Math.ceil(total / 2);

    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons
          name={
            correctCount === total
              ? "trophy"
              : passed
                ? "checkmark-circle"
                : "book"
          }
          size={56}
          color={
            correctCount === total ? "#F59E0B" : passed ? "#10B981" : "#3B82F6"
          }
        />
        <Text style={[styles.finishedTitle, { color: colors.text }]}>
          {correctCount === total
            ? "Perfect Score!"
            : passed
              ? "Nice Work!"
              : "Keep Learning!"}
        </Text>
        <Text style={[styles.finishedScore, { color: colors.textSecondary }]}>
          {correctCount}/{total} correct
        </Text>

        <View style={styles.resultActions}>
          <Pressable style={styles.finishBtn} onPress={onFinish}>
            <Text style={styles.finishBtnText}>
              {passed ? "Complete Lesson" : "Complete Anyway"}
            </Text>
          </Pressable>

          {!passed && (
            <Pressable
              style={[
                styles.rereadBtn,
                { backgroundColor: colors.backgroundElement },
              ]}
              onPress={onReread}
            >
              <Text style={[styles.rereadBtnText, { color: colors.text }]}>
                Re-read Lesson
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: colors.text }]}>
          Quick Check
        </Text>
        <Pressable onPress={onSkip} hitSlop={12}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            Skip
          </Text>
        </Pressable>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIdx + 1) / questions.length) * 100}%` },
          ]}
        />
      </View>

      <Text style={[styles.counter, { color: colors.textSecondary }]}>
        {currentIdx + 1} / {questions.length}
      </Text>

      <Text style={[styles.question, { color: colors.text }]}>
        {current.question}
      </Text>

      <View style={styles.options}>
        {current.options.map((opt, idx) => {
          let bg: string = colors.backgroundElement;
          if (showResult && idx === current.correct) bg = "#10B981";
          else if (showResult && idx === selected && idx !== current.correct)
            bg = "#EF4444";

          return (
            <Pressable
              key={idx}
              style={[styles.option, { backgroundColor: bg }]}
              onPress={() => handleSelect(idx)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color:
                      showResult &&
                      (idx === current.correct || idx === selected)
                        ? "#fff"
                        : colors.text,
                  },
                ]}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {showResult && (
        <View style={styles.explanationBox}>
          <Text style={[styles.explanation, { color: colors.textSecondary }]}>
            {selected === current.correct ? "✓ Correct! " : "✗ Incorrect. "}
            {current.explanation}
          </Text>
          <Pressable style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
              {currentIdx < questions.length - 1 ? "Next" : "See Results"}
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.four,
    gap: Spacing.three,
  },
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
  nextLessonBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  nextLessonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  quizBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  quizBtnText: { fontSize: 16, fontWeight: "600" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  skipText: { fontSize: 15, fontWeight: "500" },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(128,128,128,0.2)",
    marginHorizontal: Spacing.four,
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
  counter: {
    textAlign: "center",
    marginTop: Spacing.three,
    fontSize: 13,
  },
  question: {
    fontSize: 20,
    fontWeight: "600",
    padding: Spacing.four,
    textAlign: "center",
  },
  options: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  option: {
    padding: Spacing.three,
    borderRadius: 12,
  },
  optionText: { fontSize: 15, fontWeight: "500" },
  explanationBox: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  explanation: { fontSize: 14, lineHeight: 20 },
  nextBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  finishedIcon: { marginBottom: 8 },
  finishedTitle: { fontSize: 24, fontWeight: "700" },
  finishedScore: { fontSize: 16 },
  resultActions: { width: "100%", gap: Spacing.two, marginTop: Spacing.two },
  finishBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  finishBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  rereadBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  rereadBtnText: { fontSize: 16, fontWeight: "600" },
});
