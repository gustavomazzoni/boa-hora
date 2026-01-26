import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, TouchableOpacity } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  const HeaderRightIcon = () => (
    <TouchableOpacity onPress={() => alert("Star icon pressed!")}>
      <Ionicons name="settings-outline" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: styles.container,
          // headerTintColor: "#fff", // Changes the color of the back button and title
          headerTitleStyle: styles.headerTitle,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Contrações",
            headerRight: () => <HeaderRightIcon />,
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6EE7B7", //, "#34D399"],
    borderBottomColor: "#6EE7B7",
  },
  topContainer: {
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: "white",
    // fontSize: 18,
    fontWeight: "bold",
    // letterSpacing: 1,
  },
});
