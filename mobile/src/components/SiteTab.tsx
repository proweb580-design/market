import * as WebBrowser from "expo-web-browser";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { API_URL } from "@/lib/api";
import { useTheme } from "@/lib/theme";

// Screen for a tab whose content lives on the website: opens the page when the tab is focused.
export function SiteTab({ path, title }: { path: string; title: string }) {
  const t = useTheme();
  const open = useCallback(() => WebBrowser.openBrowserAsync(`${API_URL}${path}`), [path]);

  useFocusEffect(
    useCallback(() => {
      open();
    }, [open]),
  );

  return (
    <View style={[styles.wrap, { backgroundColor: t.bg }]}>
      <Text style={[styles.title, { color: t.text }]}>{title}</Text>
      <Text style={[styles.hint, { color: t.muted }]}>Этот раздел открывается на сайте.</Text>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, { backgroundColor: t.accent, opacity: pressed ? 0.85 : 1 }]}
      >
        <Text style={{ color: t.onAccent, fontWeight: "600" }}>Открыть «{title}»</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
  title: { fontSize: 20, fontWeight: "700" },
  hint: { fontSize: 14, textAlign: "center" },
  button: { marginTop: 12, paddingHorizontal: 20, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
