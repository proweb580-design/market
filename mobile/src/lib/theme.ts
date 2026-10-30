import { useColorScheme } from "react-native";

// Light palette mirrors the site's globals.css tokens.
const light = {
  bg: "#ffffff",
  surface: "#f6f7fb",
  text: "#292930",
  muted: "#6b6b75",
  accent: "#2563d9",
  onAccent: "#ffffff",
  success: "#127a36",
  danger: "#c01f48",
  line: "rgba(0,0,0,0.08)",
};

const dark: typeof light = {
  bg: "#111114",
  surface: "#1d1d22",
  text: "#f2f2f5",
  muted: "#a0a0ab",
  accent: "#5b8def",
  onAccent: "#ffffff",
  success: "#4cc777",
  danger: "#f0607f",
  line: "rgba(255,255,255,0.1)",
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}
