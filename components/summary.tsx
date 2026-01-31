import { getThemeColors } from "@/constants/theme";
import { formatDuration } from "@/helpers/time";
import { Contraction, getLastHourSummary } from "@/services/contractions";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  contractions: Contraction[];
};

export default function Summary({ contractions }: Props) {
  // Summary Stats
  const summary = getLastHourSummary(contractions);

  return (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Última Hora</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.colHeader}>Contrações</Text>
          <Text style={styles.statValue}>{summary.count}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.colHeader}>Duração (m.)</Text>
          <Text style={styles.statValue}>
            {summary.avgDuration != null
              ? formatDuration(summary.avgDuration)
              : "--"}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.colHeader}>Frequência (m.)</Text>
          <Text style={styles.statValue}>
            {summary.avgFrequency != null
              ? formatDuration(summary.avgFrequency)
              : "--"}
          </Text>
        </View>
      </View>
      {summary.regularity != null && (
        <Text style={[styles.colHeader, { marginTop: 10 }]}>
          Ritmo: {summary.regularity.label}
        </Text>
      )}
    </View>
  );
}

const themeColors = getThemeColors();

const styles = StyleSheet.create({
  statsContainer: {
    alignItems: "center",
  },
  statsTitle: {
    color: themeColors.summaryTitle,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
  },
  colHeader: {
    color: themeColors.summaryLabel, // "#8D7A6D", // "#84A98C", // "#A0C9C3", // "#E0F2F1",
    fontSize: 13,
    fontWeight: "600",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: themeColors.summaryValue, // "#6B705C", // "#5D4037", // "white",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 4,
  },
});
