import { getThemeColors } from "@/constants/theme";
import {
  formatDate,
  formatDuration,
  formatTime,
  getDateKey,
  getDiffMinutes,
} from "@/helpers/time";
import { Contraction } from "@/services/contractions";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  contractions: Contraction[];
  onDeleteContraction: (
    id: string,
    startTime: string,
    duration: number,
  ) => void;
};

export default function ContractionsList({
  contractions,
  onDeleteContraction,
}: Props) {
  // Determines if we should show a break (empty line, empty freq)
  const isBreak = (index: number) => {
    if (index >= contractions.length - 1) return true; // Last item always "breaks" to nothing
    const current = contractions[index];
    const next = contractions[index + 1];
    const diff = getDiffMinutes(current.startTime, next.startTime);
    return diff > 60; // Break if > 60 mins
  };

  const getFrequencyText = (index: number) => {
    if (isBreak(index)) return ""; // Return empty string for break

    const current = contractions[index];
    const next = contractions[index + 1];

    const diffMs = new Date(current.startTime) - new Date(next.startTime);
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    return `${diffMins}:${diffSecs < 10 ? "0" : ""}${diffSecs}`;
  };

  const isFirstOfDate = (index: number) => {
    if (index === contractions.length - 1) return true; // Oldest item always shows date
    const current = contractions[index];
    const next = contractions[index + 1];
    return getDateKey(current.startTime) !== getDateKey(next.startTime);
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: Contraction;
    index: number;
  }) => (
    <View style={styles.row}>
      {/* Time Column */}
      <View style={styles.timeCol}>
        <Text style={styles.timeText}>{formatTime(item.startTime)}</Text>
        {isFirstOfDate(index) && (
          <Text style={[styles.colLabel, styles.dateText]}>
            {formatDate(item.startTime)}
          </Text>
        )}
      </View>

      {/* Timeline Visual */}
      <View style={styles.timelineCol}>
        {/* CONDITIONAL LINE: Hide if it's a break */}
        {!isBreak(index) && <View style={styles.line} />}

        <Pressable
          onLongPress={() =>
            onDeleteContraction(item.id, item.startTime, item.duration)
          }
          style={({ pressed }) => [
            styles.circle,
            pressed && styles.circlePressed,
          ]}
        >
          <Text style={styles.circleText}>{formatDuration(item.duration)}</Text>
        </Pressable>
      </View>

      {/* Frequency Column */}
      <View style={styles.freqCol}>
        {/* CONDITIONAL TEXT: Hide if it's a break */}
        <Text style={styles.freqText}>{getFrequencyText(index)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.listContainer}>
      {contractions.length > 0 ? (
        <View style={styles.listHeaderRow}>
          <Text style={[styles.colLabel, { flex: 1, textAlign: "right" }]}>
            Hora
          </Text>
          <Text style={[styles.colLabel, { width: 80, textAlign: "center" }]}>
            Duração
          </Text>
          <Text style={[styles.colLabel, { flex: 1, textAlign: "left" }]}>
            Frequência
          </Text>
        </View>
      ) : (
        <Text style={styles.emptyListText}>
          Cronometre suas contrações e o aplicativo {"\n"}informará se é hora de
          ir para o hospital.
        </Text>
      )}

      <FlatList
        data={contractions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 150, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const themeColors = getThemeColors();

const styles = StyleSheet.create({
  // List
  listContainer: {
    flex: 1,
    marginTop: 10,
  },
  emptyListText: {
    color: themeColors.timeline.frequencyText, // "#5D4037", // "#009688",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 15,
  },
  listHeaderRow: {
    flexDirection: "row",
    paddingHorizontal: 30,
    marginBottom: 5,
  },
  colLabel: {
    color: themeColors.timeline.columnLabel, // "#A3B18A", // "#C8AD9E", // "#B2DFDB",
    fontSize: 12,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    height: 85, // Fixed height for alignment (increased to accommodate date)
    alignItems: "center",
    justifyContent: "center",
  },
  timeCol: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 15,
  },
  timeText: {
    color: themeColors.timeline.hourText, // "#AFA298", // "#B2DFDB",
    fontSize: 14,
  },
  dateText: {
    position: "absolute",
    top: 40,
    right: 0,
  },
  timelineCol: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  line: {
    position: "absolute",
    width: 2,
    height: "100%",
    backgroundColor: themeColors.timeline.line, //"#D4A5A5", // "#E0F2F1", // Vertical line color
    top: 42, // Start from center of circle downwards (adjusted for 85px row height)
    zIndex: -1,
  },
  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: themeColors.timeline.circle, //"#D4A5A5", // "#A0C9C3", //"#E8C3C3", // "#4CD964",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: themeColors.timeline.circle, //"#E8C3C3", // "#4CD964",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  circleText: {
    color: themeColors.timeline.circleText, //"white",
    fontWeight: "bold",
    fontSize: 14,
  },
  circlePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  freqCol: {
    flex: 1,
    paddingLeft: 15,
  },
  freqText: {
    color: themeColors.timeline.frequencyText, //"#6B705C", // "#5D4037", // "#9E9E9E",
    fontSize: 16,
    fontWeight: "400",
  },
});
