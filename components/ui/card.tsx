import { getThemeColors } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = PropsWithChildren<{
  type: "warning" | "alert";
}>;

export default function Card({ type, children }: Props) {
  const renderCardIcon = () => (
    <View style={styles.icon}>
      <FontAwesome5
        name={type === "alert" ? "hospital" : "exclamation-circle"}
        size={26}
        color={themeColors.alert.icon}
      />
    </View>
  );

  return (
    <View style={styles.card}>
      {renderCardIcon()}
      <Text style={styles.warningText}>{children}</Text>
    </View>
  );
}

const themeColors = getThemeColors();

const styles = StyleSheet.create({
  card: {
    // backgroundColor: "rgba(255,255,255,0.5)",
    // borderRadius: 25,
    // padding: 15,
    alignItems: "center",
  },
  alertCard: {
    backgroundColor: themeColors.alert.background, //"#FF6B6B",
  },
  icon: {
    backgroundColor: themeColors.alert.iconBackground, // "#FF8A80",
    padding: 10,
    borderRadius: 50,
    marginBottom: 10,
  },
  alertText: {
    color: themeColors.alert.text, //"white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
    marginTop: 10,
  },
  warningText: {
    color: themeColors.alert.text, // "#D32F2F",
    backgroundColor: themeColors.alert.background, // "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    // marginBottom: 15,
  },
});
