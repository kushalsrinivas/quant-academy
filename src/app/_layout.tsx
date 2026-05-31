import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";

import { initAllLessons } from "@/data/register";
import { migrateDb } from "@/lib/db/schema";
import { Stack } from "expo-router";

initAllLessons();

function LoadingFallback() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SQLiteProvider
        databaseName="quantacademy.db"
        onInit={migrateDb}
        useSuspense
      >
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="lesson/[moduleId]/index"
              options={{ headerShown: true, title: "Lessons" }}
            />
            <Stack.Screen
              name="lesson/[moduleId]/[lessonId]"
              options={{ headerShown: true, title: "Lesson" }}
            />
            <Stack.Screen
              name="quiz/[moduleId]/[lessonId]"
              options={{
                headerShown: true,
                title: "Quiz",
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="simulation/order-book"
              options={{ headerShown: true, title: "Order Book Simulator" }}
            />
            <Stack.Screen
              name="simulation/coin-toss"
              options={{ headerShown: true, title: "Coin Toss Simulator" }}
            />
            <Stack.Screen
              name="simulation/stock-comparison"
              options={{ headerShown: true, title: "Stock Comparison" }}
            />
            <Stack.Screen
              name="simulation/exchange"
              options={{ headerShown: true, title: "Exchange Simulator" }}
            />
            <Stack.Screen
              name="strategy/builder"
              options={{ headerShown: true, title: "Strategy Builder" }}
            />
            <Stack.Screen
              name="strategy/results"
              options={{ headerShown: true, title: "Backtest Results" }}
            />
            <Stack.Screen
              name="problem/[id]"
              options={{ headerShown: true, title: "Problem" }}
            />
          </Stack>
        </ThemeProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
