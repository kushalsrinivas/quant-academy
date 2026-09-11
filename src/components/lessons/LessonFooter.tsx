import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Spacing } from "@/constants/theme";
import type { Lesson } from "@/lib/content/types";

interface Props {
  prev: { moduleId: string; lesson: Lesson } | null;
  next: { moduleId: string; lesson: Lesson } | null;
  index: number;
  total: number;
  completed: boolean;
  hasQuiz: boolean;
  onPrev: () => void;
  onNext: () => void;
  onCompleteNext: () => void;
  colors: Record<string, string> & { text: string; textSecondary: string };
}

export function LessonFooter({
  prev,
  next,
  index,
  total,
  completed,
  onPrev,
  onNext,
  onCompleteNext,
  colors,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.counter, { color: colors.textSecondary }]}>
        Lesson {index + 1} of {total}
      </Text>
      <View style={styles.row}>
        <Pressable
          style={[
            styles.navBtn,
            {
              backgroundColor: colors.backgroundElement,
              opacity: prev ? 1 : 0.4,
            },
          ]}
          onPress={onPrev}
          disabled={!prev}
          accessibilityLabel="Previous lesson"
        >
          <Ionicons name="arrow-back" size={16} color={colors.text} />
          <Text style={[styles.navText, { color: colors.text }]} numberOfLines={1}>
            {prev ? prev.lesson.title : "Start"}
          </Text>
        </Pressable>
        {completed ? (
          <Pressable
            style={[styles.nextBtn, { opacity: next ? 1 : 0.4 }]}
            onPress={onNext}
            disabled={!next}
            accessibilityLabel="Next lesson"
          >
            <Text style={styles.nextText} numberOfLines={1}>
              {next ? `Next: ${next.lesson.title}` : "Path complete"}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </Pressable>
        ) : (
          <Pressable
            style={styles.nextBtn}
            onPress={onCompleteNext}
            accessibilityLabel="Complete and continue"
          >
            <Text style={styles.nextText}>
              {next ? "Complete & Next" : "Complete Lesson"}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, gap: 8 },
  counter: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  row: { flexDirection: "row", gap: 8 },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  navText: { fontSize: 13, fontWeight: "600", flex: 1 },
  nextBtn: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  nextText: { color: "#fff", fontSize: 14, fontWeight: "700", flex: 1, textAlign: "center" },
});
