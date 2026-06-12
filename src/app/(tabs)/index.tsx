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
import { getLessonsForModule } from "@/lib/content/loader";
import { MODULES } from "@/lib/content/modules";
import { getAllProgress } from "@/lib/db/progress";
import { getLevelForXP, getTotalXP } from "@/lib/db/xp";

export default function LearnScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const [totalXP, setTotalXP] = useState(0);
  const [completedMap, setCompletedMap] = useState<Record<string, number>>({});

  const loadData = useCallback(async () => {
    const xp = await getTotalXP(db);
    setTotalXP(xp);
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
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Quant Academy
        </Text>
        <View style={[styles.levelBadge, { backgroundColor: "#3B82F6" }]}>
          <Ionicons name="shield-checkmark" size={14} color="#fff" />
          <Text style={styles.levelText}>
            Lv.{level.level} {level.title}
          </Text>
          <Text style={styles.xpText}>{totalXP} XP</Text>
        </View>
      </View>

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
              <View
                style={[
                  styles.moduleIconWrap,
                  { backgroundColor: mod.color + "18" },
                ]}
              >
                <Ionicons name={mod.icon as any} size={22} color={mod.color} />
              </View>
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
                    { width: `${progress * 100}%`, backgroundColor: mod.color },
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.four,
  },
  title: { fontSize: 28, fontWeight: "700" },
  levelBadge: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
    flexDirection: "row",
    alignSelf: "flex-start",
    gap: Spacing.two,
  },
  levelText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  xpText: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  moduleCard: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    borderRadius: 16,
    padding: Spacing.three,
  },
  moduleHeader: {
    flexDirection: "row",
    gap: Spacing.three,
    alignItems: "center",
  },
  moduleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
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
