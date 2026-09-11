import { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Spacing } from "@/constants/theme";
import type { QuizSection } from "@/lib/content/types";

interface Props {
  questions: QuizSection[];
  colors: Record<string, string> & { text: string; textSecondary: string; background: string; backgroundElement: string };
  onFinish: () => void;
  onReread: () => void;
  onRecord: (score: number, total: number, answers: number[]) => void;
}

export function CompletionQuiz({ questions, colors, onFinish, onReread, onRecord }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const current = questions[currentIdx]!;

  const handleSelect = useCallback(
    (idx: number) => {
      if (showResult) return;
      setSelected(idx);
      setShowResult(true);
      setAnswers((a) => [...a, idx]);
      if (idx === current?.correct) setCorrectCount((c) => c + 1);
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
      onRecord(correctCount, questions.length, answers);
    }
  }, [currentIdx, questions.length, correctCount, answers, onRecord]);

  const handleRetry = useCallback(() => {
    setCurrentIdx(0);
    setSelected(null);
    setShowResult(false);
    setCorrectCount(0);
    setAnswers([]);
    setFinished(false);
  }, []);

  if (finished) {
    const total = questions.length;
    const passed = correctCount >= Math.ceil(total / 2);
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons
          name={correctCount === total ? "trophy" : passed ? "thumbs-up" : "book"}
          size={64}
          color={correctCount === total ? "#F59E0B" : passed ? "#3B82F6" : colors.textSecondary}
        />
        <Text style={[styles.finishedTitle, { color: colors.text }]}>
          {correctCount === total ? "Perfect Score!" : passed ? "Nice Work!" : "Keep Learning!"}
        </Text>
        <Text style={[styles.finishedScore, { color: colors.textSecondary }]}>
          {correctCount}/{total} correct
        </Text>
        <View style={styles.resultActions}>
          <Pressable style={styles.finishBtn} onPress={onFinish}>
            <Text style={styles.finishBtnText}>Complete Lesson</Text>
          </Pressable>
          <Pressable
            style={[styles.rereadBtn, { backgroundColor: colors.backgroundElement }]}
            onPress={handleRetry}
          >
            <Text style={[styles.rereadBtnText, { color: colors.text }]}>Retry Quiz</Text>
          </Pressable>
          {!passed && (
            <Pressable
              style={[styles.rereadBtn, { backgroundColor: colors.backgroundElement }]}
              onPress={onReread}
            >
              <Text style={[styles.rereadBtnText, { color: colors.text }]}>Re-read Lesson</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: colors.text }]}>Quick Check</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          Answer all {questions.length} to complete
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((currentIdx + 1) / questions.length) * 100}%` }]} />
      </View>
      <Text style={[styles.counter, { color: colors.textSecondary }]}>
        {currentIdx + 1} / {questions.length}
      </Text>
      <Text style={[styles.question, { color: colors.text }]}>{current.question}</Text>
      <View style={styles.options}>
        {current.options.map((opt, idx) => {
          let bg: string = colors.backgroundElement;
          if (showResult && idx === current.correct) bg = "#10B981";
          else if (showResult && idx === selected && idx !== current.correct) bg = "#EF4444";
          return (
            <Pressable key={idx} style={[styles.option, { backgroundColor: bg }]} onPress={() => handleSelect(idx)}>
              <Text
                style={[
                  styles.optionText,
                  {
                    color:
                      showResult && (idx === current.correct || idx === selected)
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
            {selected === current.correct ? "Correct! " : "Incorrect. "}
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
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.four, gap: Spacing.three },
  finishedTitle: { fontSize: 24, fontWeight: "700" },
  finishedScore: { fontSize: 16 },
  resultActions: { width: "100%", gap: Spacing.two, marginTop: Spacing.two },
  finishBtn: { backgroundColor: "#3B82F6", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  finishBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  rereadBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  rereadBtnText: { fontSize: 16, fontWeight: "600" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: Spacing.two },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  progressBar: { height: 4, backgroundColor: "rgba(128,128,128,0.2)", marginHorizontal: Spacing.four, borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: "#3B82F6", borderRadius: 2 },
  counter: { textAlign: "center", marginTop: Spacing.three, fontSize: 13 },
  question: { fontSize: 20, fontWeight: "600", padding: Spacing.four, textAlign: "center" },
  options: { paddingHorizontal: Spacing.four, gap: Spacing.two },
  option: { padding: Spacing.three, borderRadius: 12 },
  optionText: { fontSize: 15, fontWeight: "500" },
  explanationBox: { padding: Spacing.four, gap: Spacing.three },
  explanation: { fontSize: 14, lineHeight: 20 },
  nextBtn: { backgroundColor: "#3B82F6", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
