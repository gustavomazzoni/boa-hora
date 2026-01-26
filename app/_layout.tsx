import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  const HeaderRightIcon = () => (
    <Pressable
      onPress={() => alert("Star icon pressed!")}
      style={styles.iconButton}
    >
      <Ionicons name="information-circle-outline" size={24} color="#34D399" />
    </Pressable>
  );

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
            // headerRight: () => <HeaderRightIcon />,
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#6EE7B7", //, "#34D399"],
    borderBottomWidth: 0,
  },
  headerTitle: {
    color: "white",
    // fontSize: 18,
    fontWeight: "bold",
    // letterSpacing: 1,
  },
  iconButton: {
    padding: 6,
    backgroundColor: "transparent",
  },
});
