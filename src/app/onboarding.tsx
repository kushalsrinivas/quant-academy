import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Spacing } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingStep {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  bullets: string[];
}

const STEPS: OnboardingStep[] = [
  {
    icon: "trending-up",
    iconColor: "#3B82F6",
    title: "Learn Quant Trading",
    subtitle: "Not videos. Not PDFs. Interactive learning.",
    bullets: [
      "10 modules from markets to HFT",
      "100 lessons with quizzes",
      "Real concepts that HRT looks for",
    ],
  },
  {
    icon: "flask",
    iconColor: "#8B5CF6",
    title: "Build & Simulate",
    subtitle: "Hands-on tools to learn by doing.",
    bullets: [
      "Order book & exchange simulators",
      "Probability experiments",
      "Stock comparison tools",
    ],
  },
  {
    icon: "analytics",
    iconColor: "#10B981",
    title: "Strategy Builder",
    subtitle: "Create strategies. Run backtests. Instantly.",
    bullets: [
      "Define buy/sell conditions",
      "Backtest on historical data",
      "Track Sharpe, drawdown, win rate",
    ],
  },
  {
    icon: "trophy",
    iconColor: "#F59E0B",
    title: "Level Up",
    subtitle: "Earn XP. Unlock achievements. Rise through the ranks.",
    bullets: [
      "Intern to HFT Engineer",
      "15 achievements to unlock",
      "Interview prep for top firms",
    ],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const flatListRef = useRef<FlatList>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setCurrentIndex(idx);
    },
    [],
  );

  const goNext = useCallback(() => {
    if (currentIndex < STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex]);

  const completeOnboarding = useCallback(async () => {
    await db.runAsync(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('onboarding_complete', '1')",
    );
    router.replace("/(tabs)" as never);
  }, [db, router]);

  const isLast = currentIndex === STEPS.length - 1;

  const renderStep = useCallback(
    ({ item }: { item: OnboardingStep }) => (
      <View style={[styles.stepContainer, { width: SCREEN_WIDTH }]}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: item.iconColor + "18" },
          ]}
        >
          <Ionicons name={item.icon} size={56} color={item.iconColor} />
        </View>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          {item.subtitle}
        </Text>
        <View style={styles.bulletsContainer}>
          {item.bullets.map((bullet, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={item.iconColor}
              />
              <Text style={[styles.bulletText, { color: colors.text }]}>
                {bullet}
              </Text>
            </View>
          ))}
        </View>
      </View>
    ),
    [colors],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: insets.top + Spacing.four }}>
        <Pressable style={styles.skipBtn} onPress={completeOnboarding}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            Skip
          </Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={STEPS}
        renderItem={renderStep}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {STEPS.map((_, i) => {
          const inputRange = [
            (i - 1) * SCREEN_WIDTH,
            i * SCREEN_WIDTH,
            (i + 1) * SCREEN_WIDTH,
          ];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: "clamp",
          });
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: "#3B82F6",
                },
              ]}
            />
          );
        })}
      </View>

      {/* Bottom Button */}
      <View
        style={[
          styles.bottomArea,
          { paddingBottom: insets.bottom + Spacing.four },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={isLast ? completeOnboarding : goNext}
        >
          <Text style={styles.primaryBtnText}>
            {isLast ? "Let's Go" : "Next"}
          </Text>
          {!isLast && <Ionicons name="arrow-forward" size={18} color="#fff" />}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  skipText: { fontSize: 15, fontWeight: "500" },
  stepContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.six,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.five,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.five,
  },
  bulletsContainer: {
    alignSelf: "stretch",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  bulletText: {
    fontSize: 15,
    flex: 1,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: Spacing.four,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  bottomArea: {
    paddingHorizontal: Spacing.four,
  },
  primaryBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
