import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabEmoji({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3B82F6",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Learn",
          tabBarIcon: () => <TabEmoji emoji="📚" />,
        }}
      />
      <Tabs.Screen
        name="sandbox"
        options={{
          title: "Sandbox",
          tabBarIcon: () => <TabEmoji emoji="⚡" />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: "Practice",
          tabBarIcon: () => <TabEmoji emoji="💼" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: () => <TabEmoji emoji="👤" />,
        }}
      />
    </Tabs>
  );
}
