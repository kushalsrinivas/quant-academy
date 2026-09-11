export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  moduleIds: string[];
  problemCategories: string[];
  estimatedHours: number;
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "trader",
    title: "Trader Path",
    description: "Markets, technicals, backtesting and microstructure for active traders.",
    icon: "trending-up",
    color: "#3B82F6",
    moduleIds: ["markets-101", "technical-factors", "backtesting", "market-microstructure"],
    problemCategories: ["math", "probability"],
    estimatedHours: 12,
  },
  {
    id: "quant-researcher",
    title: "Quant Researcher",
    description: "Probability, statistics, math and research methods for signal work.",
    icon: "flask",
    color: "#8B5CF6",
    moduleIds: ["probability", "statistics", "math-for-quants", "quant-research", "python-for-quants"],
    problemCategories: ["coding", "math", "probability"],
    estimatedHours: 18,
  },
  {
    id: "interview-sprint",
    title: "Interview Sprint",
    description: "Fastest route to HRT-style interviews: probability, math and prep.",
    icon: "briefcase",
    color: "#F97316",
    moduleIds: ["probability", "math-for-quants", "interview-prep"],
    problemCategories: ["coding", "probability", "math", "brainteaser", "systems"],
    estimatedHours: 8,
  },
];

export function getPathProgress(
  path: LearningPath,
  completedByModule: Record<string, number>,
  moduleTotals: Record<string, number>,
): { completed: number; total: number; pct: number } {
  let completed = 0;
  let total = 0;
  for (const m of path.moduleIds) {
    completed += completedByModule[m] ?? 0;
    total += moduleTotals[m] ?? 10;
  }
  return { completed, total, pct: total > 0 ? completed / total : 0 };
}
