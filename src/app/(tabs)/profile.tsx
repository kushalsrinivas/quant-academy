import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";

import { Colors, Spacing } from "@/constants/theme";
import { CertificateCard } from "@/components/share/ShareCards";
import { MODULES } from "@/lib/content/modules";
import {
  ACHIEVEMENT_DEFS,
  getUnlockedAchievements,
} from "@/lib/db/achievements";
import { getAllProgress } from "@/lib/db/progress";
import { getTodayActivity, type DayActivity } from "@/lib/db/streaks";
import { DISCORD_INVITE_URL } from "@/lib/challenge/weekly";
import { getLocale, setLocale, type MarketLocale } from "@/lib/market/locale";
import { captureAndShare } from "@/lib/share/capture";
import {
  cancelScheduledReminders,
  disableReminders,
  enableReminders,
  isReminderEnabled,
} from "@/lib/notifications";
import { getLevelForXP, getTotalXP, LEVELS } from "@/lib/db/xp";

export default function ProfileScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const [totalXP, setTotalXP] = useState(0);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [completedMap, setCompletedMap] = useState<Record<string, number>>({});
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [activity, setActivity] = useState<DayActivity | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [locale, setLocaleState] = useState<MarketLocale>("IN");
  const [sharing, setSharing] = useState(false);
  const certRef = useRef<any>(null);

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
    setTotalCompleted(progress.length);
    setActivity(await getTodayActivity(db));
    setNotifEnabled(await isReminderEnabled(db));
    setLocaleState(await getLocale(db));
  }, [db]);

  const handleNotifToggle = useCallback(
    async (value: boolean) => {
      if (value) {
        const granted = await enableReminders(db);
        setNotifEnabled(granted);
        if (!granted) {
          Alert.alert(
            "Notifications off",
            "Enable them in Settings to get reminders.",
          );
        }
      } else {
        await disableReminders(db);
        setNotifEnabled(false);
      }
    },
    [db],
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const level = getLevelForXP(totalXP);

  const handleLocaleChange = useCallback(
    async (next: MarketLocale) => {
      setLocaleState(next);
      await setLocale(db, next);
    },
    [db],
  );

  const handleShareCertificate = useCallback(async () => {
    if (sharing) return;
    setSharing(true);
    const ok = await captureAndShare(certRef, "Share certificate");
    setSharing(false);
    if (!ok) {
      Alert.alert("Share unavailable", "Sharing is not available on this device.");
    }
  }, [sharing]);

  const handleDiscord = useCallback(async () => {
    await db.runAsync(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('discord_joined', '1')",
    );
    await WebBrowser.openBrowserAsync(DISCORD_INVITE_URL);
  }, [db]);

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

      {/* Streak Stats */}
      <View style={styles.streakRow}>
        <View
          style={[styles.streakCard, { backgroundColor: colors.backgroundElement }]}
        >
          <Ionicons name="flame" size={24} color="#F59E0B" />
          <Text style={[styles.streakCardValue, { color: colors.text }]}>
            {activity?.streak ?? 0}
          </Text>
          <Text
            style={[styles.streakCardLabel, { color: colors.textSecondary }]}
          >
            Day streak
          </Text>
        </View>
        <View
          style={[styles.streakCard, { backgroundColor: colors.backgroundElement }]}
        >
          <Ionicons name="medal" size={24} color="#8B5CF6" />
          <Text style={[styles.streakCardValue, { color: colors.text }]}>
            {activity?.bestStreak ?? 0}
          </Text>
          <Text
            style={[styles.streakCardLabel, { color: colors.textSecondary }]}
          >
            Best streak
          </Text>
        </View>
        <View
          style={[styles.streakCard, { backgroundColor: colors.backgroundElement }]}
        >
          <Ionicons
            name={activity?.goalMet ? "checkmark-circle" : "checkmark-circle-outline"}
            size={24}
            color={activity?.goalMet ? "#10B981" : colors.textSecondary}
          />
          <Text style={[styles.streakCardValue, { color: colors.text }]}>
            {activity?.lessonsToday ?? 0}/{activity?.goal ?? 1}
          </Text>
          <Text
            style={[styles.streakCardLabel, { color: colors.textSecondary }]}
          >
            Today&apos;s goal
          </Text>
        </View>
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
              <Ionicons name={a.icon} size={28} color={colors.text} />
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
            <Ionicons name={mod.icon} size={20} color={mod.color} />
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

      {/* Notifications */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Market Region
      </Text>
      <View style={[styles.notifRow, { backgroundColor: colors.backgroundElement }]}>
        <Ionicons name="globe-outline" size={20} color="#3B82F6" />
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, { color: colors.text }]}>
            {locale === "IN" ? "India · NSE · ₹" : "US · NYSE · $"}
          </Text>
          <Text style={[styles.notifDesc, { color: colors.textSecondary }]}>
            {locale === "IN"
              ? "NIFTY 50 data · 9:15 AM – 3:30 PM IST · SEBI"
              : "US data · 9:30 AM – 4:00 PM ET · SEC"}
          </Text>
        </View>
      </View>
      <View style={styles.localeRow}>
        {(["IN", "US"] as MarketLocale[]).map((l) => (
          <Pressable
            key={l}
            style={[
              styles.localeBtn,
              { backgroundColor: locale === l ? "#3B82F6" : colors.backgroundElement },
            ]}
            onPress={() => handleLocaleChange(l)}
          >
            <Text style={[styles.localeText, { color: locale === l ? "#fff" : colors.text }]}>
              {l === "IN" ? "🇮🇳 India" : "🇺🇸 US"}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Certificates & Community
      </Text>
      <View style={[styles.certCard, { backgroundColor: colors.backgroundElement }]}>
        <Ionicons name="medal" size={24} color="#F59E0B" />
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, { color: colors.text }]}>
            {totalCompleted}/100 lessons · {level.title}
          </Text>
          <Text style={[styles.notifDesc, { color: colors.textSecondary }]}>
            Share your progress certificate
          </Text>
        </View>
      </View>
      <View style={styles.localeRow}>
        <Pressable
          style={[styles.localeBtn, { backgroundColor: "#10B981", flex: 1 }]}
          onPress={handleShareCertificate}
        >
          <Text style={[styles.localeText, { color: "#fff" }]}>
            {sharing ? "Preparing…" : "Share Certificate"}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.localeBtn, { backgroundColor: "#5865F2", flex: 1 }]}
          onPress={handleDiscord}
        >
          <Text style={[styles.localeText, { color: "#fff" }]}>Join Discord</Text>
        </Pressable>
      </View>
      <View style={styles.offscreen} pointerEvents="none">
        <ViewShot ref={certRef} options={{ format: "png", quality: 1 }}>
          <CertificateCard
            title={totalCompleted >= 100 ? "Quant Academy Graduate" : `${totalCompleted} Lessons Complete`}
            subtitle={`Level ${level.level} · ${level.title} · ${totalXP} XP`}
            level={level.title}
            date={new Date().toISOString().slice(0, 10)}
          />
        </ViewShot>
      </View>

      {/* Notifications */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Notifications
      </Text>
      <View
        style={[
          styles.notifRow,
          { backgroundColor: colors.backgroundElement },
        ]}
      >
        <Ionicons name="notifications-outline" size={20} color="#F59E0B" />
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, { color: colors.text }]}>
            Daily reminder
          </Text>
          <Text style={[styles.notifDesc, { color: colors.textSecondary }]}>
            One evening nudge to protect your streak
          </Text>
        </View>
        <Switch
          value={notifEnabled}
          onValueChange={handleNotifToggle}
          trackColor={{ false: colors.backgroundSelected, true: "#3B82F6" }}
        />
      </View>

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
                    DELETE FROM activity_days;
                    DELETE FROM backtest_runs;
                    DELETE FROM problem_attempts;
                    DELETE FROM weekly_attempts;
                    DELETE FROM settings;
                  `);
                  await cancelScheduledReminders();
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
  streakRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  streakCard: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: "center",
  },
  streakCardValue: { fontSize: 20, fontWeight: "700", marginTop: 4 },
  streakCardLabel: { fontSize: 11, marginTop: 2 },
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
  notifRow: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    borderRadius: 12,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: "600" },
  notifDesc: { fontSize: 12, marginTop: 2 },
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
  localeRow: {
    flexDirection: "row",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  localeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  localeText: { fontSize: 14, fontWeight: "700" },
  certCard: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    borderRadius: 12,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  offscreen: { position: "absolute", left: -1000, top: 0, opacity: 0 },
});
