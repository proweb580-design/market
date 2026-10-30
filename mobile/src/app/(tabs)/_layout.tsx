import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useTheme } from "@/lib/theme";

// Same sections as the site header. Cart, favorites, compare and login live on the site, so their tabs open it in an in-app browser.
export default function TabLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: t.bg },
        headerTintColor: t.text,
        headerShadowVisible: false,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.bg, borderTopColor: t.line },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "TechStore",
          tabBarLabel: "Каталог",
          tabBarIcon: ({ focused, size }) => <Ionicons name="grid-outline" size={size} color={focused ? t.accent : t.muted} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Избранное",
          tabBarLabel: "Избранное",
          tabBarIcon: ({ focused, size }) => <Ionicons name="heart-outline" size={size} color={focused ? t.accent : t.muted} />,
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: "Сравнение",
          tabBarLabel: "Сравнение",
          tabBarIcon: ({ focused, size }) => <Ionicons name="git-compare-outline" size={size} color={focused ? t.accent : t.muted} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Корзина",
          tabBarLabel: "Корзина",
          tabBarIcon: ({ focused, size }) => <Ionicons name="cart-outline" size={size} color={focused ? t.accent : t.muted} />,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: "Войти",
          tabBarLabel: "Войти",
          tabBarIcon: ({ focused, size }) => <Ionicons name="log-in-outline" size={size} color={focused ? t.accent : t.muted} />,
        }}
      />
    </Tabs>
  );
}
