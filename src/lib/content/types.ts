export interface ModuleMeta {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  color: string;
  lessonCount: number;
}

export interface EditableParam {
  name: string;
  label: string;
  default: number;
  min: number;
  max: number;
  step?: number;
}

export interface TextSection {
  type: "text";
  content: string;
}

export interface InteractiveSection {
  type: "interactive";
  widget: string;
  config: Record<string, unknown>;
}

export interface CodeSection {
  type: "code";
  language: string;
  code: string;
  output: string;
  editable_params?: EditableParam[];
  precomputed_outputs?: Record<string, string>;
}

export interface MathSection {
  type: "math";
  formula: string;
}

export interface ChartSection {
  type: "chart";
  chartType: "line" | "bar" | "scatter" | "distribution" | "candlestick";
  data: unknown;
  config?: Record<string, unknown>;
}

export interface QuizSection {
  type: "quiz";
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export type LessonSection =
  | TextSection
  | InteractiveSection
  | CodeSection
  | MathSection
  | ChartSection
  | QuizSection;

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  xpReward: number;
  sections: LessonSection[];
}

export interface InterviewProblem {
  id: string;
  category: "coding" | "probability" | "math" | "brainteaser" | "systems";
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  hints: string[];
  solution: string;
  xpReward: number;
}
