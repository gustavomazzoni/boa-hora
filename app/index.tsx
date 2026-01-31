import { LinearGradient } from "expo-linear-gradient"; // Standard in Expo
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import ContractionsList from "@/components/contractions-list";
import Summary from "@/components/summary";
import TimerButton from "@/components/timer-button";
import Card from "@/components/ui/card";
import { getThemeColors } from "@/constants/theme";
import { formatDuration, formatTime } from "@/helpers/time";
import {
  Contraction,
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
  const [currentStart, setCurrentStart] = useState<string | null>(null);
  const [hospitalAlert, setHospitalAlert] = useState(false);

  // 1. Load Data on Startup
  useEffect(() => {
    loadData();
  }, []);

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
  const stopContraction = (startTime: string, endTime: string) => {
    const newContraction = createContraction(startTime, endTime);

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

  const startContraction = (startTime: string) => {
    setIsContractionActive(true);
    setCurrentStart(startTime);
  };

  // --- LOGIC: Delete Contraction ---
  const handleDeleteContraction = (
    id: string,
    startTime: string,
    duration: number,
  ) => {
    Alert.alert(
      "Excluir Contração",
      `Deseja excluir a contração das ${formatTime(startTime)}h de ${formatDuration(duration)} min?`,
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
    // if (true) {
    if (hospitalAlert) {
      return (
        <Card type="alert">
          Padrão 5-1-1 Detectado!{"\n"}Contrações de 1 min a cada 5 min por 1
          hora.
          {"\n"}Hora de ligar para seu médico e ir para o hospital.
        </Card>
      );
    }

    if (contractions.length === 0 && !isContractionActive) {
      return (
        <Card type="warning">
          Se a bolsa estourar ou houver sangramento significativo, informe seu
          médico e vá para o hospital.
        </Card>
      );
    }
    return <Summary contractions={contractions} />;
  };

  return (
    <View style={styles.container}>
      {/* Green Header Background */}
      <LinearGradient
        colors={themeColors.headerGradient}
        style={styles.topContainer}
      >
        <View style={styles.contentContainer}>{renderStatusCard()}</View>
      </LinearGradient>

      {/* Main List Area */}
      <ContractionsList
        contractions={contractions}
        onDeleteContraction={handleDeleteContraction}
      />

      {/* Floating Button Overlay */}
      <TimerButton
        active={isContractionActive}
        timeStart={currentStart}
        onStartTimer={startContraction}
        onStopTimer={stopContraction}
        durationLimitInSeconds={MAX_CONTRACTION_DURATION_SECONDS}
      />
    </View>
  );
}

// --- STYLES ---

// const { width } = Dimensions.get("window");

const themeColors = getThemeColors();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background, // "#FDFBF7", // "#F9F5F0", // "#F5FDFB",
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
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 25,
    padding: 15,
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
    marginTop: 10,
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
    fontSize: 14,
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
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 4,
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
