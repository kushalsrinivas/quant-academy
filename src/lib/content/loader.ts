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
