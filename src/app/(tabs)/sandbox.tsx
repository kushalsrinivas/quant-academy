import { useRouter } from "expo-router";
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

const TOOLS = [
  {
    id: "strategy-builder",
    title: "Strategy Builder",
    description: "Create buy/sell conditions and run backtests instantly",
    icon: "🏗",
    route: "/strategy/builder",
  },
  {
    id: "order-book",
    title: "Order Book Simulator",
    description: "Place orders and watch the order book change",
    icon: "📋",
    route: "/simulation/order-book",
  },
  {
    id: "coin-toss",
    title: "Coin Toss Simulator",
    description: "Explore probability with thousands of simulations",
    icon: "🎲",
    route: "/simulation/coin-toss",
  },
  {
    id: "stock-comparison",
    title: "Stock Comparison",
    description: "Compare stocks, visualize correlation and covariance",
    icon: "📊",
    route: "/simulation/stock-comparison",
  },
  {
    id: "exchange",
    title: "Exchange Simulator",
    description: "Act as a market maker on a simulated exchange",
    icon: "🏦",
    route: "/simulation/exchange",
  },
] as const;

export default function SandboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.four,
        paddingBottom: 100,
      }}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Sandbox</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Build strategies. Run simulations. Learn by doing.
        </Text>
      </View>

      {TOOLS.map((tool) => (
        <Pressable
          key={tool.id}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: colors.backgroundElement,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={() => router.push(tool.route as never)}
        >
          <Text style={styles.cardIcon}>{tool.icon}</Text>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {tool.title}
            </Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
              {tool.description}
            </Text>
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 18 }}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.four, marginBottom: Spacing.four },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 14, marginTop: Spacing.one },
  card: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    borderRadius: 16,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  cardIcon: { fontSize: 32 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardDesc: { fontSize: 13, marginTop: 2 },
});
