import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Spacing } from "@/constants/theme";
import { MODULES } from "@/lib/content/modules";
import {
  ACHIEVEMENT_DEFS,
  getUnlockedAchievements,
} from "@/lib/db/achievements";
import { getAllProgress } from "@/lib/db/progress";
import { getLevelForXP, getTotalXP, LEVELS } from "@/lib/db/xp";

export default function ProfileScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const [totalXP, setTotalXP] = useState(0);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [completedMap, setCompletedMap] = useState<Record<string, number>>({});

  const loadData = useCallback(async () => {
    const xp = await getTotalXP(db);
    setTotalXP(xp);
    const unlocked = await getUnlockedAchievements(db);
    setUnlockedIds(unlocked);
    const progress = await getAllProgress(db);
    const map: Record<string, number> = {};
    for (const p of progress) {
      map[p.module_id] = (map[p.module_id] ?? 0) + 1;
    }
    setCompletedMap(map);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const level = getLevelForXP(totalXP);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.four,
        paddingBottom: 100,
      }}
    >
      {/* Level Card */}
      <View style={[styles.levelCard, { backgroundColor: "#3B82F6" }]}>
        <Text style={styles.levelTitle}>Level {level.level}</Text>
        <Text style={styles.levelName}>{level.title}</Text>
        <Text style={styles.xpDisplay}>{totalXP} XP</Text>
        <View style={styles.levelProgressBg}>
          <View
            style={[
              styles.levelProgressFill,
              { width: `${Math.min(level.progressToNext * 100, 100)}%` },
            ]}
          />
        </View>
        {level.nextLevel && (
          <Text style={styles.nextLevelText}>
            {level.xpForNext} XP to {level.nextLevel.title}
          </Text>
        )}
      </View>

      {/* Level Roadmap */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Level Roadmap
      </Text>
      <View
        style={[styles.roadmap, { backgroundColor: colors.backgroundElement }]}
      >
        {LEVELS.map((l) => (
          <View key={l.level} style={styles.roadmapRow}>
            <View
              style={[
                styles.roadmapDot,
                {
                  backgroundColor:
                    totalXP >= l.xpRequired
                      ? "#3B82F6"
                      : colors.backgroundSelected,
                },
              ]}
            />
            <Text
              style={[
                styles.roadmapTitle,
                {
                  color:
                    totalXP >= l.xpRequired
                      ? colors.text
                      : colors.textSecondary,
                  fontWeight: level.level === l.level ? "700" : "400",
                },
              ]}
            >
              {l.title}
            </Text>
            <Text style={[styles.roadmapXP, { color: colors.textSecondary }]}>
              {l.xpRequired} XP
            </Text>
          </View>
        ))}
      </View>

      {/* Achievements */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Achievements ({unlockedIds.length}/{ACHIEVEMENT_DEFS.length})
      </Text>
      <View style={styles.achievementGrid}>
        {ACHIEVEMENT_DEFS.map((a) => {
          const unlocked = unlockedIds.includes(a.id);
          return (
            <View
              key={a.id}
              style={[
                styles.achievementCard,
                {
                  backgroundColor: colors.backgroundElement,
                  opacity: unlocked ? 1 : 0.4,
                },
              ]}
            >
              <Ionicons
                name={a.icon as any}
                size={24}
                color={unlocked ? colors.accent : colors.textSecondary}
              />
              <Text
                style={[styles.achievementTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {a.title}
              </Text>
              <Text
                style={[
                  styles.achievementDesc,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={2}
              >
                {a.description}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Module Progress */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Module Progress
      </Text>
      {MODULES.map((mod) => {
        const completed = completedMap[mod.id] ?? 0;
        const total = mod.lessonCount;
        return (
          <View
            key={mod.id}
            style={[
              styles.progressRow,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <Ionicons name={mod.icon as any} size={18} color={mod.color} />
            <Text style={[styles.progressName, { color: colors.text }]}>
              {mod.title}
            </Text>
            <Text
              style={[styles.progressCount, { color: colors.textSecondary }]}
            >
              {completed}/{total}
            </Text>
          </View>
        );
      })}

      {/* Data Management */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Data Management
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => {
          Alert.alert(
            "Delete All Data",
            "This will permanently delete all your progress, XP, achievements, strategies, and settings. This action cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete Everything",
                style: "destructive",
                onPress: async () => {
                  await db.execAsync(`
                    DELETE FROM user_progress;
                    DELETE FROM xp_log;
                    DELETE FROM quiz_results;
                    DELETE FROM achievements;
                    DELETE FROM strategies;
                    DELETE FROM settings;
                  `);
                  loadData();
                  Alert.alert(
                    "Data Deleted",
                    "All your data has been permanently deleted.",
                  );
                },
              },
            ],
          );
        }}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
        <View style={styles.deleteContent}>
          <Text style={styles.deleteTitle}>Delete All Data</Text>
          <Text style={styles.deleteDesc}>
            Permanently remove all progress, XP, and settings
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#EF4444" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  levelCard: {
    marginHorizontal: Spacing.four,
    borderRadius: 20,
    padding: Spacing.four,
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  levelTitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "500",
  },
  levelName: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 4 },
  xpDisplay: { color: "rgba(255,255,255,0.9)", fontSize: 16, marginTop: 8 },
  levelProgressBg: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    marginTop: Spacing.three,
  },
  levelProgressFill: {
    height: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  nextLevelText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: Spacing.one,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    marginTop: Spacing.three,
  },
  roadmap: {
    marginHorizontal: Spacing.four,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  roadmapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  roadmapDot: { width: 10, height: 10, borderRadius: 5 },
  roadmapTitle: { flex: 1, fontSize: 14 },
  roadmapXP: { fontSize: 12 },
  achievementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  achievementCard: {
    width: "47%",
    borderRadius: 12,
    padding: Spacing.three,
    alignItems: "center",
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  achievementDesc: { fontSize: 11, marginTop: 2, textAlign: "center" },
  progressRow: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    borderRadius: 12,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  progressName: { flex: 1, fontSize: 14, fontWeight: "500" },
  progressCount: { fontSize: 13 },
  deleteButton: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.four,
    borderRadius: 12,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  deleteContent: { flex: 1 },
  deleteTitle: { fontSize: 15, fontWeight: "600", color: "#EF4444" },
  deleteDesc: { fontSize: 12, color: "#EF4444", opacity: 0.7, marginTop: 2 },
});
