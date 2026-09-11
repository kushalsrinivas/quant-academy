import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";

import { NotificationBootstrap } from "@/components/NotificationBootstrap";
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
          <NotificationBootstrap />
          <Stack
            screenOptions={{
              headerShown: false,
              headerBackTitle: "Back",
              headerTintColor: "#3B82F6",
              headerTitleStyle: { fontWeight: "600" },
            }}
          >
            <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="lesson/[moduleId]/index"
              options={{
                headerShown: true,
                title: "Lessons",
                headerBackTitle: "Learn",
              }}
            />
            <Stack.Screen
              name="lesson/[moduleId]/[lessonId]"
              options={{
                headerShown: true,
                title: "Lesson",
                headerBackTitle: "Lessons",
              }}
            />
            <Stack.Screen
              name="quiz/[moduleId]/[lessonId]"
              options={{
                headerShown: true,
                title: "Quiz",
                headerBackTitle: "Lesson",
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="simulation/order-book"
              options={{ headerShown: true, title: "Order Book", headerBackTitle: "Sandbox" }}
            />
            <Stack.Screen
              name="simulation/coin-toss"
              options={{ headerShown: true, title: "Coin Toss Lab", headerBackTitle: "Sandbox" }}
            />
            <Stack.Screen
              name="simulation/stock-comparison"
              options={{ headerShown: true, title: "Stock Comparison", headerBackTitle: "Sandbox" }}
            />
            <Stack.Screen
              name="simulation/exchange"
              options={{ headerShown: true, title: "Exchange Simulator", headerBackTitle: "Sandbox" }}
            />
            <Stack.Screen
              name="simulation/options"
              options={{ headerShown: true, title: "Options Playground", headerBackTitle: "Sandbox" }}
            />
            <Stack.Screen
              name="simulation/monte-carlo"
              options={{ headerShown: true, title: "Monte Carlo Lab", headerBackTitle: "Sandbox" }}
            />
            <Stack.Screen
              name="strategy/builder"
              options={{ headerShown: true, title: "Strategy Builder", headerBackTitle: "Sandbox" }}
            />
            <Stack.Screen
              name="strategy/results"
              options={{ headerShown: true, title: "Backtest Results", headerBackTitle: "Builder" }}
            />
            <Stack.Screen
              name="problem/[id]"
              options={{ headerShown: true, title: "Problem", headerBackTitle: "Practice" }}
            />
            <Stack.Screen
              name="practice/[category]"
              options={{ headerShown: true, title: "Practice", headerBackTitle: "Practice" }}
            />
            <Stack.Screen
              name="review"
              options={{ headerShown: true, title: "Weak-Topic Review", headerBackTitle: "Learn" }}
            />
            <Stack.Screen
              name="path/[pathId]"
              options={{ headerShown: true, title: "Learning Path", headerBackTitle: "Learn" }}
            />
            <Stack.Screen
              name="challenge/[weekId]"
              options={{ headerShown: true, title: "Weekly Challenge", headerBackTitle: "Learn" }}
            />
          </Stack>
        </ThemeProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
