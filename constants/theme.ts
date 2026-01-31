/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export function getThemeColors() {
  return getColorsByTheme("elegant");
}
export function getColorsByTheme(
  theme: "elegant" | "baby" | "vintage" | "medical",
) {
  return Colors["elegant"];
}

export const Colors = {
  elegant: {
    headerGradient: ["#C8AD9E", "#E6CCB2"], // Clay to Sand
    headerText: "#FFFFFF",
    background: "#FDFBF7", // Cream/Sand
    summaryTitle: "#FFFFFF",
    summaryLabel: "#8D7A6D",
    summaryValue: "#5D4037",
    timeline: {
      columnLabel: "#C8AD9E",
      hourText: "#AFA298",
      line: "#E6CCB2",
      circle: "#D4A5A5", // Dusty Rose
      circleText: "#FFFFFF",
      frequencyText: "#5D4037",
    },
    button: {
      start: "#84A98C", // Sage Green
      startBorder: "#E0F8F7",
      stop: "#C08585",
      stopBorder: "#FFEBEE",
      text: "#FFFFFF",
      overlayGradient: [
        "rgba(253,251,247,0)",
        "rgba(253,251,247,0.9)",
        "#FDFBF7",
      ],
    },
    alert: {
      background: "#E07A5F",
      text: "#FFFFFF",
    },
  },
  baby: {
    headerGradient: ["#FFB7B2", "#FFDAC1"], // Blush to peach
    headerText: "#FFFFFF",
    background: "#FFF9FA", // Hint of rose
    summaryTitle: "#FFFFFF",
    summaryLabel: "#B5A4A3",
    summaryValue: "#6D6875",
    timeline: {
      columnLabel: "#FFB7B2",
      hourText: "#C9C9C9",
      line: "#FFB7B2",
      circle: "#FFB7B2", // Blush
      circleText: "#FFFFFF",
      frequencyText: "#6D6875",
    },
    button: {
      start: "#B5D8B8", // Pistachio
      startBorder: "#E0F8F7",
      stop: "#FF9AA2",
      stopBorder: "#FFEBEE",
      text: "#FFFFFF",
      overlayGradient: [
        "rgba(253,251,247,0)",
        "rgba(253,251,247,0.9)",
        "#FDFBF7",
      ],
    },
    alert: {
      background: "#E07A5F",
      text: "#FFFFFF",
    },
  },
  vintage: {
    headerGradient: ["#9E8276", "#D4A5A5"], // Warm cedar to Old rose
    headerText: "#FFFFFF",
    background: "#FFFCF2", // Antique white
    summaryTitle: "#FFFFFF",
    summaryLabel: "#6D5A51",
    summaryValue: "#3E2723",
    timeline: {
      columnLabel: "#A5A58D",
      hourText: "#9E8276",
      line: "#E6CCB2",
      circle: "#B08968", // Light Wood
      circleText: "#FFFFFF",
      frequencyText: "#3E2723",
    },
    button: {
      start: "#6B705C", // Olive Green
      startBorder: "#E0F8F7",
      stop: "#D4A5A5",
      stopBorder: "#FFEBEE",
      text: "#FFFFFF",
      overlayGradient: [
        "rgba(253,251,247,0)",
        "rgba(253,251,247,0.9)",
        "#FDFBF7",
      ],
    },
    alert: {
      background: "#E07A5F",
      text: "#FFFFFF",
    },
  },
  medical: {
    headerGradient: ["#6EE7B7", "#34D399"],
    headerText: "#FFFFFF",
    background: "#F5FDFB",
    summaryTitle: "#FFFFFF",
    summaryLabel: "#E0F2F1",
    summaryValue: "#FFFFFF",
    timeline: {
      columnLabel: "#B2DFDB",
      hourText: "#B2DFDB",
      line: "#4CD964",
      circle: "#4CD964",
      circleText: "#FFFFFF",
      frequencyText: "#009688",
    },
    button: {
      start: "#4CD964", // Sage Green
      startBorder: "#E0F8F7",
      stop: "#FF5252", // Terracotta
      stopBorder: "#FFEBEE",
      text: "#FFFFFF",
      overlayGradient: [
        "rgba(253,251,247,0)",
        "rgba(253,251,247,0.9)",
        "#FDFBF7",
      ],
    },
    alert: {
      background: "#E07A5F",
      text: "#FFFFFF",
    },
  },
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
