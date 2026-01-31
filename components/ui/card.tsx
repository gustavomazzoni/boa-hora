import { getThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = PropsWithChildren<{
  type: "warning" | "alert";
}>;

export default function Card({ type, children }: Props) {
  const getCardStyles = () =>
    type === "alert" ? [styles.card, styles.alertCard] : styles.card;
  const renderCardIcon = () =>
    type === "alert" ? (
      <Ionicons name="warning" size={32} color="#FFF" />
    ) : (
      <View style={styles.shieldIcon}>
        <Ionicons name="medical" size={24} color="white" />
      </View>
    );
  const getTextStyle = () =>
    type === "alert" ? styles.alertText : styles.warningText;

  return (
    <View style={getCardStyles()}>
      {renderCardIcon()}
      <Text style={getTextStyle()}>{children}</Text>
    </View>
  );
}

const themeColors = getThemeColors("natural");

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
  shieldIcon: {
    backgroundColor: "#FF8A80",
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
    color: "#D32F2F",
    backgroundColor: "#FFEBEE",
    padding: 10,
    borderRadius: 8,
    textAlign: "center",
    marginBottom: 15,
    fontSize: 13,
    fontWeight: "600",
  },
  instructionText: {
    color: "#009688",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
});
