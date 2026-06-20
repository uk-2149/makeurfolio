import { ThemeConfig } from "./shared/types";

export const themeConfigs: Record<string, ThemeConfig> = {
  "minimal-editorial": {
    id: "minimal-editorial",
    colors: {
      canvas: "#fafafa",
      surface: "#ffffff",
      surfaceElevated: "#f5f5f5",
      border: "#eaeaea",
      ink: "#111111",
      mute: "#666666",
      primary: "#000000",
    },
    typography: {
      fontFamily: "Inter, system-ui, sans-serif",
    },
  },
  "vercel": {
    id: "vercel",
    colors: {
      canvas: "#fafafa",
      surface: "#ffffff",
      surfaceElevated: "#f5f5f5",
      border: "#eaeaea",
      ink: "#171717",
      mute: "#666666",
      primary: "#0070f3",
    },
    typography: {
      fontFamily: "Geist, Inter, system-ui, sans-serif",
    },
  },
  "linear": {
    id: "linear",
    colors: {
      canvas: "#010102",
      surface: "#13141a",
      surfaceElevated: "#1a1b23",
      border: "#282933",
      ink: "#f4f5f8",
      mute: "#8a8f98",
      primary: "#5e6ad2",
    },
    typography: {
      fontFamily: "Inter, system-ui, sans-serif",
    },
  },
  "stripe": {
    id: "stripe",
    colors: {
      canvas: "#ffffff",
      surface: "#f5e9d4",
      surfaceElevated: "#e6e0f5",
      border: "#e6e6e6",
      ink: "#0a2540",
      mute: "#425466",
      primary: "#533afd",
    },
    typography: {
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
  },
  "raycast": {
    id: "raycast",
    colors: {
      canvas: "#000000",
      surface: "#111111",
      surfaceElevated: "#222222",
      border: "#333333",
      ink: "#ffffff",
      mute: "#888888",
      primary: "#ff6363", // Raycast red accent
    },
    typography: {
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    },
  },
  "notion": {
    id: "notion",
    colors: {
      canvas: "#ffffff",
      surface: "#f7f6f3",
      surfaceElevated: "#edece9",
      border: "#e1dfdd",
      ink: "#37352f",
      mute: "#9b9a97",
      primary: "#2383e2",
    },
    typography: {
      fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, 'Apple Color Emoji', Arial, sans-serif",
    },
  },
  "wise": {
    id: "wise",
    colors: {
      canvas: "#e8ebe6",
      surface: "#ffffff",
      surfaceElevated: "#ffffff",
      border: "rgba(14, 15, 12, 0.05)",
      ink: "#0e0f0c",
      mute: "#868685",
      primary: "#9fe870",
    },
    typography: {
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    },
  },
};

export const DEFAULT_THEME_CONFIG = themeConfigs["minimal-editorial"];
