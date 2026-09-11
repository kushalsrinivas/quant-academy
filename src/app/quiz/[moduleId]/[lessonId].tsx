import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { AchievementBanner } from "@/components/AchievementBanner";
import { Colors, Spacing } from "@/constants/theme";
import { getLesson } from "@/lib/content/loader";
import type { QuizSection } from "@/lib/content/types";
import {
  getAchievementDef,
  unlockAchievement,
  type AchievementDef,
} from "@/lib/db/achievements";
import { getPerfectQuizCount, recordQuizResult } from "@/lib/db/quiz";
import { recordActivity } from "@/lib/db/streaks";
import { addXP, hasEarnedXPFor, XP_VALUES } from "@/lib/db/xp";

export default function QuizScreen() {
  const { moduleId, lessonId } = useLocalSearchParams<{
    moduleId: string;
    lessonId: string;
  }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const lesson = getLesson(moduleId ?? "", lessonId ?? "");
  const questions = useMemo(
    () =>
      (lesson?.sections.filter((s) => s.type === "quiz") ??
        []) as QuizSection[],
    [lesson],
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [newUnlocks, setNewUnlocks] = useState<AchievementDef[]>([]);

  const current = questions[currentIdx];

  const handleSelect = useCallback(
    (idx: number) => {
      if (showResult) return;
      setSelected(idx);
      setShowResult(true);
      setAnswers((a) => [...a, idx]);
      if (idx === current?.correct) {
        setCorrectCount((c) => c + 1);
      }
    },
    [showResult, current],
  );

  const handleNext = useCallback(async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setFinished(true);
      const score = correctCount;
      const total = questions.length;
      const sourceId = `${moduleId}/${lessonId}`;
      await recordQuizResult(db, {
        moduleId: moduleId ?? "",
        lessonId: lessonId ?? "",
        score,
        total,
        answers,
      });
      if ((await getPerfectQuizCount(db)) >= 10) {
        if (await unlockAchievement(db, "quiz_ace")) {
          const def = getAchievementDef("quiz_ace");
          if (def) setNewUnlocks([def]);
        }
      }
      const alreadyEarned = await hasEarnedXPFor(db, "quiz", sourceId);
      if (!alreadyEarned) {
        const xp =
          score === total
            ? XP_VALUES.quiz_perfect
            : Math.round(
                XP_VALUES.quiz_partial_min +
                  ((XP_VALUES.quiz_partial_max - XP_VALUES.quiz_partial_min) *
                    score) /
                    total,
              );
        await addXP(db, xp, "quiz", sourceId);
        await recordActivity(db, { xp });
      }
    }
  }, [
    currentIdx,
    questions.length,
    correctCount,
    answers,
    moduleId,
    lessonId,
    db,
  ]);

  if (questions.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.noQuiz, { color: colors.text }]}>
          No quiz questions for this lesson.
        </Text>
      </View>
    );
  }

  if (finished) {
    const finalScore = correctCount;
    const total = questions.length;
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons
          name={
            finalScore === total
              ? "trophy"
              : finalScore >= total / 2
                ? "thumbs-up"
                : "book"
          }
          size={64}
          color={
            finalScore === total
              ? "#F59E0B"
              : finalScore >= total / 2
                ? "#3B82F6"
                : colors.textSecondary
          }
        />
        <Text style={[styles.finishedTitle, { color: colors.text }]}>
          {finalScore === total ? "Perfect Score!" : "Quiz Complete"}
        </Text>
        <Text style={[styles.finishedScore, { color: colors.textSecondary }]}>
          {finalScore}/{total} correct
        </Text>
        <View style={styles.unlockWrap}>
          <AchievementBanner achievements={newUnlocks} />
        </View>
        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Stack.Screen
        options={{
          title: lesson ? `${lesson.title.slice(0, 22)} Quiz` : "Quiz",
          headerBackTitle: "Lesson",
        }}
      />
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
  noQuiz: { fontSize: 16 },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(128,128,128,0.2)",
  },
  progressFill: {
    height: 4,
    backgroundColor: "#3B82F6",
  },
  counter: {
    textAlign: "center",
    marginTop: Spacing.four,
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
  finishedTitle: { fontSize: 24, fontWeight: "700" },
  finishedScore: { fontSize: 16 },
  unlockWrap: { width: "100%" },
  doneBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: Spacing.six,
    borderRadius: 12,
  },
  doneBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
