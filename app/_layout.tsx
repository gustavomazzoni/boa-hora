import { getThemeColors } from "@/constants/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false, // Removes the border/shadow
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "BoaHora | Monitore suas Contrações",
          }}
        />
      </Stack>
    </>
  );
}

const themeColors = getThemeColors();

const styles = StyleSheet.create({
  header: {
    backgroundColor: themeColors.headerGradient[0], // "#C8AD9E", // "#D4A5A5", // "#6EE7B7", //, "#34D399"],
    borderBottomWidth: 0,
  },
  headerTitle: {
    color: themeColors.headerText, // "white", //"#6B705C",
    // fontSize: 18,
    fontWeight: "bold",
    // letterSpacing: 1,
  },
  iconButton: {
    padding: 6,
    backgroundColor: "transparent",
  },
});
