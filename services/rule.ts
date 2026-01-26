import { getDiffMinutes } from "@/helpers/time";
import { Contraction } from "@/services/contractions";

// 5-1-1 Rule thresholds with tolerance
const MAX_FREQUENCY_MINUTES = 5.5; // Contractions should be ~5 mins apart (with 30s tolerance)
const MIN_DURATION_SECONDS = 45; // Contractions should last ~1 min (with 15s tolerance)
const PATTERN_DURATION_MS = 60 * 60 * 1000; // Pattern must persist for 1 hour (3600000 ms)

/**
 * Checks the 5-1-1 Hospital Rule:
 * - Contractions are 5 minutes apart (frequency)
 * - Each lasting 1 minute (duration)
 * - Pattern persists for 1 hour
 *
 * Returns true if it's time to go to the hospital.
 */
export const checkHospitalRule = (list: Contraction[]): boolean => {
  if (!list || list.length < 3) return false;

  let validStreakDurationMs = 0;

  // Scan backwards from the newest contraction (index 0)
  for (let i = 0; i < list.length - 1; i++) {
    const current = list[i];
    const older = list[i + 1];

    const freqMinutes = getDiffMinutes(current.startTime, older.startTime);
    const durationSeconds = current.duration;

    // 5-1-1 Criteria with tolerance:
    // Frequency <= 5.5 mins (5 mins + 30s tolerance)
    // Duration >= 45 secs (1 min - 15s tolerance)
    if (
      freqMinutes <= MAX_FREQUENCY_MINUTES &&
      durationSeconds >= MIN_DURATION_SECONDS
    ) {
      // This gap is part of a valid pattern
      // Add time to streak (time from older start to current start)
      const gapMs =
        new Date(current.startTime).getTime() -
        new Date(older.startTime).getTime();
      validStreakDurationMs += gapMs;
    } else {
      // Pattern broken - stop checking
      break;
    }

    // Check if we have hit the 1 hour threshold
    if (validStreakDurationMs >= PATTERN_DURATION_MS) {
      return true;
    }
  }

  // Pattern did not persist for 1 hour
  return false;
};
