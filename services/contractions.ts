import { getDiffMinutes } from "@/helpers/time";

export interface Contraction {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
}

// Maximum duration a contraction can last (in seconds)
// Medical fact: contractions typically last 30-90 seconds
export const MAX_CONTRACTION_DURATION_SECONDS = 90;

/**
 * Calculates the effective duration of a contraction, capped at 90 seconds.
 * If the elapsed time exceeds 90 seconds, returns 90.
 */
export const getEffectiveDuration = (
  startTime: string,
  endTime: string
): number => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const durationSeconds = Math.floor((end - start) / 1000);

  return Math.min(durationSeconds, MAX_CONTRACTION_DURATION_SECONDS);
};

/**
 * Creates a new contraction object with duration capped at 90 seconds.
 */
export const createContraction = (
  startTime: string,
  endTime: string
): Contraction => {
  const duration = getEffectiveDuration(startTime, endTime);

  // If duration was capped, adjust the endTime to match
  const effectiveEndTime =
    duration === MAX_CONTRACTION_DURATION_SECONDS
      ? new Date(
          new Date(startTime).getTime() + MAX_CONTRACTION_DURATION_SECONDS * 1000
        ).toISOString()
      : endTime;

  return {
    id: Date.now().toString(),
    startTime,
    endTime: effectiveEndTime,
    duration,
  };
};

/**
 * Checks if a contraction that started at the given time should be auto-stopped.
 * Returns true if more than 90 seconds have elapsed since startTime.
 */
export const shouldAutoStop = (startTime: string): boolean => {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  const elapsedSeconds = (now - start) / 1000;

  return elapsedSeconds >= MAX_CONTRACTION_DURATION_SECONDS;
};

/**
 * Deletes a contraction from the list by ID.
 * Returns a new array without the deleted item (does not mutate original).
 */
export const deleteContraction = (
  contractions: Contraction[],
  id: string | null | undefined,
): Contraction[] => {
  if (!contractions || !Array.isArray(contractions)) {
    return [];
  }

  if (!id) {
    return contractions;
  }

  return contractions.filter((c) => c.id !== id);
};

export const getLastHourContractions = (
  contractions: Contraction[],
): Contraction[] => {
  return contractions.filter((c) => {
    const diff = getDiffMinutes(new Date().toISOString(), c.startTime);
    return diff <= 60;
  });
};

export const countLastHourContractions = (
  contractions: Contraction[],
): number => {
  return getLastHourContractions(contractions).length;
};

export interface RegularityResult {
  label: string;
  stdDevSeconds: number;
}

export interface SummaryStats {
  count: number;
  avgDuration: number | null;
  avgFrequency: number | null;
  regularity: RegularityResult | null;
}

export const getLastHourSummary = (
  contractions: Contraction[],
): SummaryStats => {
  const recent = getLastHourContractions(contractions);
  const count = recent.length;

  if (count === 0) {
    return { count: 0, avgDuration: null, avgFrequency: null, regularity: null };
  }

  // Average duration (seconds)
  const totalDuration = recent.reduce((sum, c) => sum + c.duration, 0);
  const avgDuration = Math.round(totalDuration / count);

  // Intervals between consecutive contractions (sorted newest-first)
  // Sort by startTime descending to ensure correct ordering
  const sorted = [...recent].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  );

  let avgFrequency: number | null = null;
  let regularity: RegularityResult | null = null;

  if (count >= 2) {
    const intervals: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const diffMs =
        new Date(sorted[i].startTime).getTime() -
        new Date(sorted[i + 1].startTime).getTime();
      intervals.push(diffMs / 1000);
    }

    const totalInterval = intervals.reduce((sum, v) => sum + v, 0);
    avgFrequency = Math.round(totalInterval / intervals.length);

    // Regularity requires >= 3 contractions (2+ intervals)
    if (intervals.length >= 2) {
      const mean = totalInterval / intervals.length;
      const variance =
        intervals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / intervals.length;
      const stdDev = Math.sqrt(variance);

      regularity = {
        label: stdDev < 60 ? "Rítmico" : "Irregular",
        stdDevSeconds: stdDev,
      };
    }
  }

  return { count, avgDuration, avgFrequency, regularity };
};
