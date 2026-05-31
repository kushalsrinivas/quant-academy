import { MathView } from "@dawsonxiong/react-native-latex-renderer/lib/module/MathView";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { LessonSection } from "@/lib/content/types";

type ThemeColors = {
  text: string;
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  textSecondary: string;
  [key: string]: string;
};

interface Props {
  section: LessonSection;
  colors: ThemeColors;
}

export function ContentBlock({ section, colors }: Props) {
  switch (section.type) {
    case "text":
      return <TextBlock content={section.content} colors={colors} />;
    case "code":
      return (
        <CodeBlock
          code={section.code}
          language={section.language}
          output={section.output}
          editableParams={section.editable_params}
          precomputedOutputs={section.precomputed_outputs}
          colors={colors}
        />
      );
    case "math":
      return <MathBlock formula={section.formula} colors={colors} />;
    case "quiz":
      return (
        <InlineQuiz
          question={section.question}
          options={section.options}
          correct={section.correct}
          explanation={section.explanation}
          colors={colors}
        />
      );
    case "chart":
      return <ChartPlaceholder chartType={section.chartType} colors={colors} />;
    case "interactive":
      return <InteractivePlaceholder widget={section.widget} colors={colors} />;
    default:
      return null;
  }
}

function TextBlock({
  content,
  colors,
}: {
  content: string;
  colors: ThemeColors;
}) {
  const paragraphs = content.split("\n\n");
  return (
    <View style={styles.textBlock}>
      {paragraphs.map((p, i) => {
        if (p.startsWith("# ")) {
          return (
            <Text key={i} style={[styles.heading1, { color: colors.text }]}>
              {p.slice(2)}
            </Text>
          );
        }
        if (p.startsWith("## ")) {
          return (
            <Text key={i} style={[styles.heading2, { color: colors.text }]}>
              {p.slice(3)}
            </Text>
          );
        }
        if (p.startsWith("- ")) {
          const items = p.split("\n").filter((l) => l.startsWith("- "));
          return (
            <View key={i} style={styles.bulletList}>
              {items.map((item, j) => (
                <View key={j} style={styles.bulletRow}>
                  <Text
                    style={[styles.bullet, { color: colors.textSecondary }]}
                  >
                    •
                  </Text>
                  <Text style={[styles.bulletText, { color: colors.text }]}>
                    {item.slice(2)}
                  </Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <Text key={i} style={[styles.paragraph, { color: colors.text }]}>
            {p}
          </Text>
        );
      })}
    </View>
  );
}

function CodeBlock({
  code,
  language,
  output,
  editableParams,
  precomputedOutputs,
  colors,
}: {
  code: string;
  language: string;
  output: string;
  editableParams?: {
    name: string;
    label?: string;
    default: number;
    min: number;
    max: number;
  }[];
  precomputedOutputs?: Record<string, string>;
  colors: ThemeColors;
}) {
  const [paramValues, setParamValues] = useState<Record<string, number>>(() => {
    const defaults: Record<string, number> = {};
    editableParams?.forEach((p) => {
      defaults[p.name] = p.default;
    });
    return defaults;
  });

  const currentOutput =
    precomputedOutputs && editableParams
      ? (precomputedOutputs[String(paramValues[editableParams[0]?.name])] ??
        output)
      : output;

  return (
    <View style={styles.codeBlock}>
      <View style={styles.codeLangBadge}>
        <Text style={styles.codeLangText}>{language}</Text>
      </View>
      <View style={[styles.codeContent, { backgroundColor: "#1E1E2E" }]}>
        <Text style={styles.codeText}>{code}</Text>
      </View>
      {editableParams && editableParams.length > 0 && (
        <View
          style={[
            styles.paramRow,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          {editableParams.map((p) => (
            <View key={p.name} style={styles.paramItem}>
              <Text
                style={[styles.paramLabel, { color: colors.textSecondary }]}
              >
                {p.label ?? p.name}
              </Text>
              <TextInput
                style={[
                  styles.paramInput,
                  {
                    color: colors.text,
                    borderColor: colors.backgroundSelected,
                  },
                ]}
                keyboardType="numeric"
                value={String(paramValues[p.name] ?? p.default)}
                onChangeText={(t) => {
                  const v = parseInt(t, 10);
                  if (!isNaN(v) && v >= p.min && v <= p.max) {
                    setParamValues((prev) => ({ ...prev, [p.name]: v }));
                  }
                }}
              />
            </View>
          ))}
        </View>
      )}
      <View
        style={[
          styles.outputBox,
          { backgroundColor: colors.backgroundElement },
        ]}
      >
        <Text style={[styles.outputLabel, { color: colors.textSecondary }]}>
          Output
        </Text>
        <Text style={[styles.outputText, { color: colors.text }]}>
          {currentOutput}
        </Text>
      </View>
    </View>
  );
}

function MathBlock({
  formula,
  colors,
}: {
  formula: string;
  colors: ThemeColors;
}) {
  return (
    <View
      style={[styles.mathBlock, { backgroundColor: colors.backgroundElement }]}
    >
      <MathView
        math={`$$${formula}$$`}
        style={{ color: colors.text }}
        fontSize={16}
      />
    </View>
  );
}

function InlineQuiz({
  question,
  options,
  correct,
  explanation,
  colors,
}: {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  colors: ThemeColors;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  return (
    <View
      style={[styles.quizBlock, { backgroundColor: colors.backgroundElement }]}
    >
      <Text style={[styles.quizLabel, { color: colors.textSecondary }]}>
        Quick Check
      </Text>
      <Text style={[styles.quizQuestion, { color: colors.text }]}>
        {question}
      </Text>
      <View style={styles.quizOptions}>
        {options.map((opt, idx) => {
          let bg = colors.backgroundSelected;
          if (answered && idx === correct) bg = "#10B981";
          else if (answered && idx === selected && idx !== correct)
            bg = "#EF4444";
          return (
            <Pressable
              key={idx}
              style={[styles.quizOption, { backgroundColor: bg }]}
              onPress={() => !answered && setSelected(idx)}
            >
              <Text
                style={[
                  styles.quizOptionText,
                  {
                    color:
                      answered && (idx === correct || idx === selected)
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
      {answered && (
        <Text style={[styles.quizExplanation, { color: colors.textSecondary }]}>
          {selected === correct ? "✓ Correct! " : "✗ Incorrect. "}
          {explanation}
        </Text>
      )}
    </View>
  );
}

function ChartPlaceholder({
  chartType,
  colors,
}: {
  chartType: string;
  colors: ThemeColors;
}) {
  return (
    <View
      style={[
        styles.chartPlaceholder,
        { backgroundColor: colors.backgroundElement },
      ]}
    >
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
        📊 {chartType} chart
      </Text>
    </View>
  );
}

function InteractivePlaceholder({
  widget,
  colors,
}: {
  widget: string;
  colors: ThemeColors;
}) {
  return (
    <View
      style={[
        styles.chartPlaceholder,
        { backgroundColor: colors.backgroundElement },
      ]}
    >
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
        🎮 Interactive: {widget}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  textBlock: { paddingHorizontal: 24, gap: 12 },
  heading1: { fontSize: 22, fontWeight: "700" },
  heading2: { fontSize: 18, fontWeight: "600" },
  paragraph: { fontSize: 15, lineHeight: 23 },
  bulletList: { gap: 6 },
  bulletRow: { flexDirection: "row", gap: 8 },
  bullet: { fontSize: 15 },
  bulletText: { fontSize: 15, lineHeight: 23, flex: 1 },
  codeBlock: {
    marginHorizontal: 24,
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 8,
  },
  codeLangBadge: {
    backgroundColor: "#313244",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  codeLangText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  codeContent: { padding: 16 },
  codeText: {
    color: "#E2E8F0",
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 20,
  },
  paramRow: { padding: 12, flexDirection: "row", gap: 16 },
  paramItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  paramLabel: { fontSize: 13 },
  paramInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 14,
    minWidth: 50,
    textAlign: "center",
  },
  outputBox: { padding: 12 },
  outputLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  outputText: { fontFamily: "monospace", fontSize: 13 },
  mathBlock: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 8,
  },
  mathText: { fontSize: 16, textAlign: "center" },
  quizBlock: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginVertical: 8,
  },
  quizLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  quizQuestion: { fontSize: 16, fontWeight: "600" },
  quizOptions: { gap: 8 },
  quizOption: { padding: 12, borderRadius: 8 },
  quizOptionText: { fontSize: 14, fontWeight: "500" },
  quizExplanation: { fontSize: 13, lineHeight: 19 },
  chartPlaceholder: {
    marginHorizontal: 24,
    height: 160,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
});
