import { Redirect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootIndex() {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    (async () => {
      const row = await db.getFirstAsync<{ value: string }>(
        "SELECT value FROM settings WHERE key = 'onboarding_complete'",
      );
      setOnboarded(row?.value === "1");
      setLoading(false);
    })();
  }, [db]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!onboarded) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
