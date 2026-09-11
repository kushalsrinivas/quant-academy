import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Spacing } from "@/constants/theme";
import { getFirstIncompleteLesson, getLessonsForModule } from "@/lib/content/loader";
import { MODULES } from "@/lib/content/modules";
import { LEARNING_PATHS } from "@/lib/content/paths";
import { currentWeekId } from "@/lib/challenge/weekly";
import type { Lesson } from "@/lib/content/types";
import { getAllProgress } from "@/lib/db/progress";
import { getTodayActivity, type DayActivity } from "@/lib/db/streaks";
import { getLevelForXP, getTotalXP } from "@/lib/db/xp";

export default function LearnScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const [totalXP, setTotalXP] = useState(0);
  const [completedMap, setCompletedMap] = useState<Record<string, number>>({});
  const [activity, setActivity] = useState<DayActivity | null>(null);
  const [continueTarget, setContinueTarget] = useState<{
    moduleId: string;
    lesson: Lesson;
  } | null>(null);

  const loadData = useCallback(async () => {
    const xp = await getTotalXP(db);
    setTotalXP(xp);
    const progress = await getAllProgress(db);
    const map: Record<string, number> = {};
    const completedSet = new Set<string>();
    for (const p of progress) {
      map[p.module_id] = (map[p.module_id] ?? 0) + 1;
      completedSet.add(`${p.module_id}/${p.lesson_id}`);
    }
    setCompletedMap(map);
    const orderedModuleIds = [...MODULES]
      .sort((a, b) => a.order - b.order)
      .map((m) => m.id);
    setContinueTarget(getFirstIncompleteLesson(orderedModuleIds, completedSet));
    setActivity(await getTodayActivity(db));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const level = getLevelForXP(totalXP);
  const continueModule = MODULES.find((m) => m.id === continueTarget?.moduleId);
  const goalProgress =
    activity && activity.goal > 0
      ? Math.min(activity.lessonsToday / activity.goal, 1)
      : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.four,
          paddingBottom: 100,
        }}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Quant Academy
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.levelBadge, { backgroundColor: "#3B82F6" }]}>
              <Ionicons name="shield-checkmark" size={14} color="#fff" />
              <Text style={styles.levelText}>
                Lv.{level.level} {level.title}
              </Text>
              <Text style={styles.xpText}>{totalXP} XP</Text>
            </View>
            <View
              style={[
                styles.streakBadge,
                {
                  backgroundColor:
                    activity && activity.streak > 0
                      ? "#F59E0B"
                      : colors.backgroundElement,
                },
              ]}
            >
              <Ionicons
                name="flame"
                size={14}
                color={
                  activity && activity.streak > 0 ? "#fff" : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.streakText,
                  {
                    color:
                      activity && activity.streak > 0
                        ? "#fff"
                        : colors.textSecondary,
                  },
                ]}
              >
                {activity?.streak ?? 0}
              </Text>
            </View>
          </View>
        </View>

        {continueTarget && continueModule ? (
          <Pressable
            style={({ pressed }) => [
              styles.continueCard,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() =>
              router.push(
                `/lesson/${continueTarget.moduleId}/${continueTarget.lesson.id}` as never,
              )
            }
          >
            <View style={styles.continueTop}>
              <View style={styles.continueInfo}>
                <Text style={styles.continueLabel}>Continue learning</Text>
                <Text style={styles.continueLesson} numberOfLines={1}>
                  {continueTarget.lesson.title}
                </Text>
                <Text style={styles.continueMeta}>
                  {continueModule.title} · {continueTarget.lesson.estimatedMinutes}{" "}
                  min · {continueTarget.lesson.xpReward} XP
                </Text>
              </View>
              <View style={styles.playButton}>
                <Ionicons name="play" size={20} color="#fff" />
              </View>
            </View>
            {activity && (
              <View style={styles.goalRow}>
                <View style={styles.goalBarBg}>
                  <View
                    style={[
                      styles.goalBarFill,
                      { width: `${goalProgress * 100}%` },
                    ]}
                  />
                </View>
                <View style={styles.goalTextRow}>
                  {activity.goalMet && (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  )}
                  <Text style={styles.goalText}>
                    Daily goal {activity.lessonsToday}/{activity.goal}
                  </Text>
                </View>
              </View>
            )}
          </Pressable>
        ) : (
          <View style={[styles.continueCard, styles.allCaughtUp]}>
            <View style={styles.caughtUpRow}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.continueLabel}>All caught up</Text>
            </View>
            <Text style={styles.continueMeta}>
              Every lesson complete. Try the Sandbox or Practice tabs.
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          This Week
        </Text>

        <View style={styles.twoCol}>
          <Pressable
            style={[styles.sideCard, { backgroundColor: "#8B5CF6" }]}
            onPress={() => router.push(`/challenge/${currentWeekId()}` as never)}
          >
            <Ionicons name="calendar" size={22} color="#fff" />
            <Text style={styles.sideTitle}>Weekly Challenge</Text>
            <Text style={styles.sideSub}>3 problems + bonus</Text>
          </Pressable>
          <Pressable
            style={[styles.sideCard, { backgroundColor: "#F59E0B" }]}
            onPress={() => router.push("/review" as never)}
          >
            <Ionicons name="refresh" size={22} color="#fff" />
            <Text style={styles.sideTitle}>Weak Review</Text>
            <Text style={styles.sideSub}>Fix low accuracy</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Learning Paths
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pathRow}
        >
          {LEARNING_PATHS.map((p) => (
            <Pressable
              key={p.id}
              style={[styles.pathCard, { backgroundColor: colors.backgroundElement }]}
              onPress={() => router.push(`/path/${p.id}` as never)}
            >
              <Ionicons name={p.icon as never} size={24} color={p.color} />
              <Text style={[styles.pathTitle, { color: colors.text }]}>{p.title}</Text>
              <Text style={[styles.pathSub, { color: colors.textSecondary }]} numberOfLines={2}>
                {p.description}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Learning Path
        </Text>

        {MODULES.map((mod) => {
          const lessons = getLessonsForModule(mod.id);
          const total = lessons.length || mod.lessonCount;
          const completed = completedMap[mod.id] ?? 0;
          const progress = total > 0 ? completed / total : 0;

          return (
            <Pressable
              key={mod.id}
              style={({ pressed }) => [
                styles.moduleCard,
                {
                  backgroundColor: colors.backgroundElement,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => router.push(`/lesson/${mod.id}` as never)}
            >
              <View style={styles.moduleHeader}>
                <Ionicons
                  name={mod.icon}
                  size={30}
                  color={mod.color}
                  style={styles.moduleIcon}
                />
                <View style={styles.moduleInfo}>
                  <Text style={[styles.moduleName, { color: colors.text }]}>
                    {mod.title}
                  </Text>
                  <Text
                    style={[styles.moduleDesc, { color: colors.textSecondary }]}
                  >
                    {mod.description}
                  </Text>
                </View>
              </View>
              <View style={styles.progressRow}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${progress * 100}%`,
                        backgroundColor: mod.color,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[styles.progressText, { color: colors.textSecondary }]}
                >
                  {completed}/{total}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.four,
  },
  title: { fontSize: 28, fontWeight: "700" },
  levelBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  levelText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  xpText: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  streakBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: { fontWeight: "700", fontSize: 13 },
  caughtUpRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  continueCard: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.four,
    borderRadius: 16,
    padding: Spacing.four,
    backgroundColor: "#3B82F6",
  },
  allCaughtUp: { backgroundColor: "#10B981", gap: 4 },
  continueTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  continueInfo: { flex: 1 },
  continueLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  continueLesson: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  continueMeta: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 2,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  goalBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  goalBarFill: { height: 6, borderRadius: 3, backgroundColor: "#fff" },
  goalTextRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  goalText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
  },
  twoCol: {
    flexDirection: "row",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  sideCard: { flex: 1, borderRadius: 16, padding: Spacing.three, gap: 4 },
  sideTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  sideSub: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  pathRow: { paddingHorizontal: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.one },
  pathCard: { width: 220, borderRadius: 16, padding: Spacing.three, gap: 6 },
  pathTitle: { fontSize: 15, fontWeight: "700" },
  pathSub: { fontSize: 12, lineHeight: 16 },
  moduleCard: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    borderRadius: 16,
    padding: Spacing.three,
  },
  moduleHeader: { flexDirection: "row", gap: Spacing.three },
  moduleIcon: { width: 34, marginTop: 2 },
  moduleInfo: { flex: 1 },
  moduleName: { fontSize: 16, fontWeight: "600" },
  moduleDesc: { fontSize: 13, marginTop: 2 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(128,128,128,0.2)",
  },
  progressBarFill: { height: 6, borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: "500", minWidth: 30 },
});
