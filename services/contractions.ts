import { getDiffMinutes } from "@/helpers/time";

export interface Contraction {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
}

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
