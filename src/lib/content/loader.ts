import type { Lesson } from "./types";

type LessonMap = Record<string, Record<string, Lesson>>;

const lessonRegistry: LessonMap = {};

export function registerLesson(lesson: Lesson) {
  if (!lessonRegistry[lesson.moduleId]) {
    lessonRegistry[lesson.moduleId] = {};
  }
  lessonRegistry[lesson.moduleId][lesson.id] = lesson;
}

export function getLesson(moduleId: string, lessonId: string): Lesson | null {
  return lessonRegistry[moduleId]?.[lessonId] ?? null;
}

export function getLessonsForModule(moduleId: string): Lesson[] {
  const moduleLessons = lessonRegistry[moduleId];
  if (!moduleLessons) return [];
  return Object.values(moduleLessons).sort((a, b) => a.order - b.order);
}

export function getAllLessonCount(moduleId: string): number {
  return Object.keys(lessonRegistry[moduleId] ?? {}).length;
}

export function getFirstIncompleteLesson(
  moduleIdsInOrder: string[],
  completed: Set<string>,
): { moduleId: string; lesson: Lesson } | null {
  for (const moduleId of moduleIdsInOrder) {
    for (const lesson of getLessonsForModule(moduleId)) {
      if (!completed.has(`${moduleId}/${lesson.id}`)) {
        return { moduleId, lesson };
      }
    }
  }
  return null;
}

export function getAdjacentLessons(
  moduleId: string,
  lessonId: string,
  allModuleIdsInOrder?: string[],
): {
  prev: { moduleId: string; lesson: Lesson } | null;
  next: { moduleId: string; lesson: Lesson } | null;
  index: number;
  total: number;
} {
  const lessons = getLessonsForModule(moduleId);
  const idx = lessons.findIndex((l) => l.id === lessonId);
  if (idx === -1) return { prev: null, next: null, index: 0, total: lessons.length };
  const prev =
    idx > 0 ? { moduleId, lesson: lessons[idx - 1]! } : null;
  let next: { moduleId: string; lesson: Lesson } | null =
    idx < lessons.length - 1 ? { moduleId, lesson: lessons[idx + 1]! } : null;
  if (!next && allModuleIdsInOrder) {
    const mi = allModuleIdsInOrder.indexOf(moduleId);
    for (let k = mi + 1; k < allModuleIdsInOrder.length; k++) {
      const modLessons = getLessonsForModule(allModuleIdsInOrder[k]!);
      if (modLessons.length > 0) {
        next = { moduleId: allModuleIdsInOrder[k]!, lesson: modLessons[0]! };
        break;
      }
    }
  }
  return { prev, next, index: idx, total: lessons.length };
}
