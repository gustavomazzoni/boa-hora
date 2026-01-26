import { Ionicons } from "@expo/vector-icons"; // Standard in Expo
import { LinearGradient } from "expo-linear-gradient"; // Standard in Expo
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  formatDate,
  formatDuration,
  formatTime,
  getDateKey,
  getDiffMinutes,
} from "@/helpers/time";
import {
  Contraction,
  countLastHourContractions,
  createContraction,
  deleteContraction,
  MAX_CONTRACTION_DURATION_SECONDS,
  shouldAutoStop,
} from "@/services/contractions";
import { getData, saveData } from "@/services/data";
import { checkHospitalRule } from "@/services/rule";
import { getState, saveState } from "@/services/state";

// --- CONSTANTS ---
const THEME_COLOR = "#4CD964";
const BG_LIGHT = "#E0F8F7";

// --- MAIN COMPONENT ---

export default function App() {
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [isContractionActive, setIsContractionActive] = useState(false);
  const [currentStart, setCurrentStart] = useState(null);
  const [timer, setTimer] = useState(0);
  const [hospitalAlert, setHospitalAlert] = useState(false);

  const timerRef = useRef(null);

  // 1. Load Data on Startup
  useEffect(() => {
    loadData();
  }, []);

  // 2. Timer Interval Logic with 90-second auto-stop
  useEffect(() => {
    if (isContractionActive && currentStart) {
      timerRef.current = setInterval(() => {
        const now = new Date();
        const start = new Date(currentStart);
        const diffInSeconds = Math.floor(
          (now.getTime() - start.getTime()) / 1000,
        );

        // Auto-stop at 90 seconds
        if (diffInSeconds >= MAX_CONTRACTION_DURATION_SECONDS) {
          stopContraction(currentStart);
        } else {
          setTimer(diffInSeconds);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isContractionActive, currentStart]);

  // 3. Save Data whenever critical state changes
  useEffect(() => {
    persistData();
  }, [contractions, isContractionActive, currentStart]);

  // --- LOGIC: Persistence ---
  const persistData = async () => {
    try {
      const stateToSave = {
        isContractionActive,
        currentStart: currentStart ? currentStart.toString() : null,
      };
      await saveData(contractions);
      await saveState(stateToSave);
    } catch (e) {
      console.error("Failed to save data", e);
    }
  };

  const loadData = async () => {
    try {
      const savedData = await getData();
      const savedState = await getState();
      let checkedRule = false;

      if (savedData) {
        setContractions(savedData);
      }

      if (savedState) {
        if (savedState.isContractionActive && savedState.currentStart) {
          // Check if contraction should be auto-stopped (>= 90 seconds elapsed)
          if (shouldAutoStop(savedState.currentStart)) {
            // Auto-stop and log the contraction with 90-second duration
            const newContraction = createContraction(
              savedState.currentStart,
              new Date().toISOString(),
            );
            const updatedList = [newContraction, ...(savedData || [])];
            setContractions(updatedList);
            setHospitalAlert(checkHospitalRule(updatedList));
            checkedRule = true;
          } else {
            // Resume timer if app was closed during contraction
            setCurrentStart(savedState.currentStart);
            setIsContractionActive(true);
          }
        }
      }

      if (!checkedRule) setHospitalAlert(checkHospitalRule(savedData));
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  // --- LOGIC: Stop Contraction ---
  const stopContraction = (startTime: string) => {
    const newContraction = createContraction(
      startTime,
      new Date().toISOString(),
    );

    // Avoid accidental taps (ignore < 2 seconds)
    if (newContraction.duration < 2) {
      setIsContractionActive(false);
      setCurrentStart(null);
      return;
    }

    const updatedList = [newContraction, ...contractions];
    setContractions(updatedList);
    setIsContractionActive(false);
    setCurrentStart(null);

    setHospitalAlert(checkHospitalRule(updatedList));
  };

  // --- LOGIC: Button Press ---
  const timeContraction = () => {
    if (!isContractionActive) {
      // START Contraction
      setIsContractionActive(true);
      setCurrentStart(new Date().toISOString());
    } else if (currentStart) {
      // STOP Contraction
      stopContraction(currentStart);
    }
  };

  // --- LOGIC: Delete Contraction ---
  const handleDeleteContraction = (id: string, duration: number) => {
    Alert.alert(
      "Excluir Contração",
      `Deseja excluir a contração de ${formatDuration(duration)}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            const updatedList = deleteContraction(contractions, id);
            setContractions(updatedList);
            setHospitalAlert(checkHospitalRule(updatedList));
          },
        },
      ],
    );
  };

  // --- LOGIC: UI Helpers ---

  // Determines if we should show a break (empty line, empty freq)
  const isBreak = (index) => {
    if (index >= contractions.length - 1) return true; // Last item always "breaks" to nothing
    const current = contractions[index];
    const next = contractions[index + 1];
    const diff = getDiffMinutes(current.startTime, next.startTime);
    return diff > 60; // Break if > 60 mins
  };

  const getFrequencyText = (index) => {
    if (isBreak(index)) return ""; // Return empty string for break

    const current = contractions[index];
    const next = contractions[index + 1];

    const diffMs = new Date(current.startTime) - new Date(next.startTime);
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    return `${diffMins}:${diffSecs < 10 ? "0" : ""}${diffSecs}`;
  };

  const isFirstOfDate = (index) => {
    if (index === contractions.length - 1) return true; // Oldest item always shows date
    const current = contractions[index];
    const next = contractions[index + 1];
    return getDateKey(current.startTime) !== getDateKey(next.startTime);
  };

  // --- RENDER COMPONENTS ---

  // const renderHeader = () => (
  //   <View style={styles.header}>
  //     <Ionicons name="settings-outline" size={24} color="white" />
  //     <Text style={styles.headerTitle}>CONTRAÇÕES</Text>
  //     <View style={styles.headerIconsRight}>
  //       <Ionicons
  //         name="happy-outline"
  //         size={24}
  //         color="white"
  //         style={{ marginRight: 15 }}
  //       />
  //       <Ionicons name="book-outline" size={24} color="white" />
  //     </View>
  //   </View>
  // );

  const renderStatusCard = () => {
    if (hospitalAlert) {
      return (
        <View style={[styles.card, styles.alertCard]}>
          <Ionicons name="warning" size={32} color="#FFF" />
          <Text style={styles.alertText}>
            Padrão 5-1-1 Detectado!{"\n"}Contrações a cada 5 min por 1 hora.
            {"\n"}Hora de ligar para seu médico e ir para o hospital.
          </Text>
        </View>
      );
    }

    if (contractions.length === 0 && !isContractionActive) {
      return (
        <View style={styles.card}>
          <View style={styles.shieldIcon}>
            <Ionicons name="medical" size={24} color="white" />
          </View>
          <Text style={styles.warningText}>
            Se a bolsa estourar ou houver sangramento significativo, vá para o
            hospital.
          </Text>
          <Text style={styles.instructionText}>
            Cronometre várias contrações e o aplicativo informará se é hora de
            ir para o hospital.
          </Text>
        </View>
      );
    }

    // Summary Stats
    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>
          Última Hora: {countLastHourContractions(contractions)} contrações
        </Text>
      </View>
    );
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.row}>
      {/* Time Column */}
      <View style={styles.timeCol}>
        {isFirstOfDate(index) && (
          <Text style={styles.timeText}>{formatDate(item.startTime)}</Text>
        )}
        <Text style={styles.timeText}>{formatTime(item.startTime)}</Text>
      </View>

      {/* Timeline Visual */}
      <View style={styles.timelineCol}>
        {/* CONDITIONAL LINE: Hide if it's a break */}
        {!isBreak(index) && <View style={styles.line} />}

        <Pressable
          onLongPress={() => handleDeleteContraction(item.id, item.duration)}
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
    <View style={styles.container}>
      {/* Green Header Background */}
      <LinearGradient
        colors={["#6EE7B7", "#34D399"]}
        style={styles.topContainer}
      >
        <View style={styles.contentContainer}>{renderStatusCard()}</View>
      </LinearGradient>

      {/* Main List Area */}
      <View style={styles.listContainer}>
        {contractions.length > 0 && (
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
        )}

        <FlatList
          data={contractions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 150, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Floating Button Overlay */}
      <LinearGradient
        colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.9)", "white"]}
        style={styles.bottomOverlay}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={[
            styles.mainButton,
            isContractionActive ? styles.buttonActive : styles.buttonIdle,
          ]}
          onPress={timeContraction}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.innerCircle,
              isContractionActive ? styles.innerActive : styles.innerIdle,
            ]}
          >
            {isContractionActive ? (
              <>
                <Text style={styles.btnTitle}>PARAR</Text>
                <Text style={styles.btnTimer}>{formatDuration(timer)}</Text>
              </>
            ) : (
              <>
                <Text style={styles.btnTitle}>CONTRAÇÃO</Text>
                <Text style={styles.btnSubtitle}>começou</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

// --- STYLES ---

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FDFB",
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
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  alertCard: {
    backgroundColor: "#FF6B6B",
  },
  shieldIcon: {
    backgroundColor: "#FF8A80",
    padding: 10,
    borderRadius: 50,
    marginBottom: 10,
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
  alertText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
    marginTop: 10,
  },
  // Stats
  statsContainer: {
    alignItems: "center",
  },
  statsTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
  },
  colHeader: {
    color: "#E0F2F1",
    fontSize: 13,
    fontWeight: "600",
  },
  // List
  listContainer: {
    flex: 1,
    marginTop: 10,
  },
  listHeaderRow: {
    flexDirection: "row",
    paddingHorizontal: 30,
    marginBottom: 5,
  },
  colLabel: {
    color: "#B2DFDB",
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
    color: "#B2DFDB",
    fontSize: 14,
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
    backgroundColor: "#E0F2F1", // Vertical line color
    top: 42, // Start from center of circle downwards (adjusted for 85px row height)
    zIndex: -1,
  },
  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#4CD964",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#4CD964",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  circleText: {
    color: "white",
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
    color: "#9E9E9E",
    fontSize: 18,
    fontWeight: "400",
  },
  // Button
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  mainButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonIdle: {
    backgroundColor: "#E0F8F7",
  },
  buttonActive: {
    backgroundColor: "#FFEBEE",
  },
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  innerIdle: {
    backgroundColor: "#4CD964", // Mint Green
  },
  innerActive: {
    backgroundColor: "#FF5252", // Red/Orange for Stop
  },
  btnTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  btnSubtitle: {
    color: "white",
    fontSize: 14,
    opacity: 0.9,
  },
  btnTimer: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 5,
  },
});
