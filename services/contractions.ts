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

export const countLastHourContractions = (
  contractions: Contraction[],
): number => {
  return contractions.filter((c) => {
    const diff = getDiffMinutes(new Date().toISOString(), c.startTime);
    return diff <= 60;
  }).length;
};
