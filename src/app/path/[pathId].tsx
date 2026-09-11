import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
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

import { Colors, Spacing } from "@/constants/theme";
import { getLessonsForModule } from "@/lib/content/loader";
import { LEARNING_PATHS, getPathProgress } from "@/lib/content/paths";
import { getAllProgress } from "@/lib/db/progress";

export default function PathScreen() {
  const { pathId } = useLocalSearchParams<{ pathId: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const path = LEARNING_PATHS.find((p) => p.id === pathId);
  const [completedMap, setCompletedMap] = useState<Record<string, number>>({});
  const [totals, setTotals] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    const progress = await getAllProgress(db);
    const map: Record<string, number> = {};
    for (const p of progress) map[p.module_id] = (map[p.module_id] ?? 0) + 1;
    setCompletedMap(map);
    const t: Record<string, number> = {};
    for (const m of path?.moduleIds ?? []) {
      t[m] = getLessonsForModule(m).length || 10;
    }
    setTotals(t);
  }, [db, path?.moduleIds]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!path) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Path not found</Text>
      </View>
    );
  }

  const prog = getPathProgress(path, completedMap, totals);

  const setActive = async () => {
    await db.runAsync(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('active_path', ?)",
      path.id,
    );
    router.back();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Stack.Screen options={{ title: path.title, headerBackTitle: "Learn" }} />
      <View style={styles.header}>
        <Ionicons name={path.icon as never} size={40} color={path.color} />
        <Text style={[styles.title, { color: colors.text }]}>{path.title}</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          {path.description} · ~{path.estimatedHours}h
        </Text>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${prog.pct * 100}%`, backgroundColor: path.color }]} />
        </View>
        <Text style={[styles.progText, { color: colors.textSecondary }]}>
          {prog.completed}/{prog.total} lessons
        </Text>
      </View>
      {path.moduleIds.map((mid, i) => {
        const done = completedMap[mid] ?? 0;
        const total = totals[mid] ?? 10;
        return (
          <Pressable
            key={mid}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: colors.backgroundElement, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => router.push(`/lesson/${mid}` as never)}
          >
            <Text style={[styles.step, { color: colors.textSecondary }]}>{i + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{mid}</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                {done}/{total} complete
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>
        );
      })}
      <Pressable style={styles.activeBtn} onPress={setActive}>
        <Text style={styles.activeText}>Set as my path</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: Spacing.four, gap: 6, alignItems: "flex-start" },
  title: { fontSize: 24, fontWeight: "800" },
  sub: { fontSize: 13, lineHeight: 18 },
  barBg: { height: 8, borderRadius: 4, backgroundColor: "rgba(128,128,128,0.2)", width: "100%", marginTop: 8 },
  barFill: { height: 8, borderRadius: 4 },
  progText: { fontSize: 12, fontWeight: "600" },
  row: { marginHorizontal: Spacing.four, marginBottom: 8, borderRadius: 12, padding: Spacing.three, flexDirection: "row", alignItems: "center", gap: 12 },
  step: { fontSize: 14, fontWeight: "800", width: 20 },
  rowTitle: { fontSize: 15, fontWeight: "700", textTransform: "capitalize" },
  rowSub: { fontSize: 12, marginTop: 2 },
  activeBtn: { margin: Spacing.four, backgroundColor: "#3B82F6", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  activeText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
