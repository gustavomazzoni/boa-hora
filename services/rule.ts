import { getDiffMinutes } from "@/helpers/time";

export const oldCheckHospitalRule = (list) => {
  if (list.length < 3) return;

  // Get last 3 contractions
  const recent = list.slice(0, 3);

  // Calculate Average Duration
  const avgDuration =
    recent.reduce((sum, item) => sum + item.duration, 0) / recent.length;

  // Calculate Average Frequency (Time between starts)
  // Note: Frequency for item[0] is (item[0].start - item[1].start)
  let totalFreq = 0;
  let count = 0;
  for (let i = 0; i < recent.length - 1; i++) {
    const startCurrent = new Date(recent[i].startTime);
    const startNext = new Date(recent[i + 1].startTime);
    const diffMinutes = (startCurrent - startNext) / 1000 / 60;
    totalFreq += diffMinutes;
    count++;
  }
  const avgFreq = totalFreq / count;

  // Rule: Freq <= 5 mins AND Duration >= 45 seconds (approx 1 min)
  return avgFreq <= 5.5 && avgDuration >= 45;
};

// --- LOGIC: 5-1-1 Rule ---
export const checkHospitalRule = (list): boolean => {
  if (list.length < 3) return false;

  let validStreakDurationMs = 0;
  let patternValid = true;

  // Scan backwards from the newest contraction (index 0)
  for (let i = 0; i < list.length - 1; i++) {
    const current = list[i];
    const older = list[i + 1];

    const freqMinutes = getDiffMinutes(current.startTime, older.startTime);
    const durationSeconds = current.duration;

    // 5-1-1 Criteria with slight tolerance:
    // Freq <= 5.5 mins AND Duration >= 45 secs
    // Also, breaks > 60 mins obviously break the pattern (handled by freq check)
    if (freqMinutes <= 5.5 && durationSeconds >= 45) {
      // This gap is part of a valid pattern.
      // Add time to streak (Time from older start to current start)
      const gapMs = new Date(current.startTime) - new Date(older.startTime);
      validStreakDurationMs += gapMs;
    } else {
      // Pattern broken
      patternValid = false;
      break;
    }

    // Check if we have hit the 1 Hour threshold
    // 1 hour = 60 * 60 * 1000 = 3600000 ms
    if (validStreakDurationMs >= 3600000) {
      return true;
    }
  }

  // If loop finishes or breaks without hitting 1 hour
  return false;
};
