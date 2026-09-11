import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { AchievementDef } from "@/lib/db/achievements";

export function AchievementBanner({
  achievements,
}: {
  achievements: AchievementDef[];
}) {
  if (achievements.length === 0) return null;
  return (
    <View style={styles.list}>
      {achievements.map((a) => (
        <View key={a.id} style={styles.banner}>
          <Ionicons name={a.icon} size={22} color="#92400E" />
          <View style={styles.textWrap}>
            <Text style={styles.kicker}>Achievement unlocked</Text>
            <Text style={styles.title}>{a.title}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  textWrap: { flex: 1 },
  kicker: {
    fontSize: 11,
    fontWeight: "600",
    color: "#92400E",
    textTransform: "uppercase",
  },
  title: { fontSize: 15, fontWeight: "700", color: "#78350F", marginTop: 1 },
});
