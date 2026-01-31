import { getThemeColors } from "@/constants/theme";
import { formatDuration, getDiffSeconds } from "@/helpers/time";
import { LinearGradient } from "expo-linear-gradient"; // Standard in Expo
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  active: boolean;
  timeStart: string | null;
  onStartTimer: (startTime: string) => void;
  onStopTimer: (startTime: string, endTime: string) => void;
  durationLimitInSeconds?: number;
};

export default function TimerButton({
  active,
  timeStart,
  onStartTimer,
  onStopTimer,
  durationLimitInSeconds,
}: Props) {
  const [timer, setTimer] = useState(0);

  const timerRef = useRef(null);

  // Timer Interval Logic with 90-second auto-stop
  useEffect(() => {
    if (active && timeStart) {
      timerRef.current = setInterval(() => {
        const diffInSeconds = getDiffSeconds(
          new Date().toISOString(),
          timeStart,
        );

        // Auto-stop at 90 seconds
        if (durationLimitInSeconds && diffInSeconds >= durationLimitInSeconds) {
          onStopTimer(timeStart, new Date().toISOString());
        } else {
          setTimer(diffInSeconds);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [active, timeStart]);

  const toggleTimer = () => {
    if (!active) {
      // START Contraction
      onStartTimer(new Date().toISOString());
    } else if (timeStart) {
      // STOP Contraction
      onStopTimer(timeStart, new Date().toISOString());
    }
  };

  return (
    <LinearGradient
      colors={themeColors.button.overlayGradient}
      style={styles.bottomOverlay}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={[
          styles.mainButton,
          active ? styles.buttonActive : styles.buttonIdle,
        ]}
        onPress={toggleTimer}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.innerCircle,
            active ? styles.innerActive : styles.innerIdle,
          ]}
        >
          {active ? (
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
  );
}

const themeColors = getThemeColors();

const styles = StyleSheet.create({
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
    backgroundColor: themeColors.button.startBorder,
  },
  buttonActive: {
    backgroundColor: themeColors.button.stopBorder,
  },
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  innerIdle: {
    backgroundColor: themeColors.button.start, //"#84A98C", // "#6B705C", // "#84A98C", // "#A0C9C3", // "#D4A5A5", // "#4CD964", // Mint Green
  },
  innerActive: {
    backgroundColor: themeColors.button.stop, //"#C08585", // "#FF5252", // Red/Orange for Stop
  },
  btnTitle: {
    color: themeColors.button.text, // "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  btnSubtitle: {
    color: themeColors.button.text, // "white",
    fontSize: 14,
    opacity: 0.9,
  },
  btnTimer: {
    color: themeColors.button.text, // "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 5,
  },
});
