import { checkHospitalRule } from "@/services/rule";
import { Contraction } from "@/services/contractions";

describe("checkHospitalRule (5-1-1 Rule)", () => {
  /**
   * Helper to generate contractions with consistent 5-minute intervals
   * starting from a base time going backwards.
   */
  const generateContractions = (
    count: number,
    options: {
      intervalMinutes?: number;
      durationSeconds?: number;
      baseTime?: Date;
    } = {}
  ): Contraction[] => {
    const {
      intervalMinutes = 5,
      durationSeconds = 60,
      baseTime = new Date("2024-01-15T12:00:00.000Z"),
    } = options;

    const contractions: Contraction[] = [];

    for (let i = 0; i < count; i++) {
      const startTime = new Date(
        baseTime.getTime() - i * intervalMinutes * 60 * 1000
      );
      const endTime = new Date(startTime.getTime() + durationSeconds * 1000);

      contractions.push({
        id: `${i + 1}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: durationSeconds,
      });
    }

    return contractions;
  };

  describe("returns false when pattern is not met", () => {
    it("should return false for empty list", () => {
      expect(checkHospitalRule([])).toBe(false);
    });

    it("should return false for null list", () => {
      expect(checkHospitalRule(null as unknown as Contraction[])).toBe(false);
    });

    it("should return false for undefined list", () => {
      expect(checkHospitalRule(undefined as unknown as Contraction[])).toBe(
        false
      );
    });

    it("should return false for less than 3 contractions", () => {
      const twoContractions = generateContractions(2);
      expect(checkHospitalRule(twoContractions)).toBe(false);
    });

    it("should return false when contractions are too far apart (>5.5 mins)", () => {
      // 13 contractions at 6-minute intervals = 72 minutes total
      // But frequency > 5.5 mins, so pattern doesn't match
      const contractions = generateContractions(13, { intervalMinutes: 6 });
      expect(checkHospitalRule(contractions)).toBe(false);
    });

    it("should return false when contractions are too short (<45 secs)", () => {
      // 13 contractions at 5-minute intervals but only 30 seconds each
      const contractions = generateContractions(13, { durationSeconds: 30 });
      expect(checkHospitalRule(contractions)).toBe(false);
    });

    it("should return false when pattern does not persist for 1 hour", () => {
      // 10 contractions at 5-minute intervals = 45 minutes (not enough)
      const contractions = generateContractions(10);
      expect(checkHospitalRule(contractions)).toBe(false);
    });

    it("should return false when pattern breaks in the middle", () => {
      // Start with valid pattern, then break it
      const contractions: Contraction[] = [
        // Newest - valid
        {
          id: "1",
          startTime: "2024-01-15T12:00:00.000Z",
          endTime: "2024-01-15T12:01:00.000Z",
          duration: 60,
        },
        // 5 mins earlier - valid
        {
          id: "2",
          startTime: "2024-01-15T11:55:00.000Z",
          endTime: "2024-01-15T11:56:00.000Z",
          duration: 60,
        },
        // Pattern break: 30 mins earlier (too far apart)
        {
          id: "3",
          startTime: "2024-01-15T11:25:00.000Z",
          endTime: "2024-01-15T11:26:00.000Z",
          duration: 60,
        },
        // Even if more valid contractions follow, pattern already broke
        {
          id: "4",
          startTime: "2024-01-15T11:20:00.000Z",
          endTime: "2024-01-15T11:21:00.000Z",
          duration: 60,
        },
      ];
      expect(checkHospitalRule(contractions)).toBe(false);
    });
  });

  describe("returns true when 5-1-1 pattern is met", () => {
    it("should return true when pattern persists for exactly 1 hour", () => {
      // 13 contractions at 5-minute intervals = 60 minutes (12 gaps of 5 mins)
      const contractions = generateContractions(13);
      expect(checkHospitalRule(contractions)).toBe(true);
    });

    it("should return true when pattern persists for more than 1 hour", () => {
      // 20 contractions at 5-minute intervals = 95 minutes
      const contractions = generateContractions(20);
      expect(checkHospitalRule(contractions)).toBe(true);
    });

    it("should return true with contractions at maximum allowed frequency (5.5 mins)", () => {
      // 12 contractions at 5.5-minute intervals = 60.5 minutes (11 gaps)
      const contractions = generateContractions(12, { intervalMinutes: 5.5 });
      expect(checkHospitalRule(contractions)).toBe(true);
    });

    it("should return true with minimum allowed duration (45 secs)", () => {
      // 13 contractions at 5-minute intervals, 45 seconds each
      const contractions = generateContractions(13, { durationSeconds: 45 });
      expect(checkHospitalRule(contractions)).toBe(true);
    });

    it("should return true with varying valid intervals (all <= 5.5 mins)", () => {
      const baseTime = new Date("2024-01-15T12:00:00.000Z");
      const contractions: Contraction[] = [];

      // Create contractions with varying intervals (3-5.5 mins)
      // Intervals must total >= 60 mins: 5+5+5+4+5+5+4+5+5+4+5+5+5 = 62 mins
      let currentTime = baseTime.getTime();
      const intervals = [5, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 5];

      for (let i = 0; i <= intervals.length; i++) {
        contractions.push({
          id: `${i + 1}`,
          startTime: new Date(currentTime).toISOString(),
          endTime: new Date(currentTime + 60000).toISOString(),
          duration: 60,
        });
        if (i < intervals.length) {
          currentTime -= intervals[i] * 60 * 1000;
        }
      }

      expect(checkHospitalRule(contractions)).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle exactly 3 contractions (minimum for check)", () => {
      // 3 contractions can only have 2 gaps, max 11 minutes - not enough for 1 hour
      const contractions = generateContractions(3);
      expect(checkHospitalRule(contractions)).toBe(false);
    });

    it("should not count contractions with duration exactly at threshold boundary", () => {
      // 44 seconds is below the 45-second threshold
      const contractions = generateContractions(13, { durationSeconds: 44 });
      expect(checkHospitalRule(contractions)).toBe(false);
    });

    it("should not count contractions with frequency exactly above threshold", () => {
      // 5.6 minutes is above the 5.5-minute threshold
      const contractions = generateContractions(13, { intervalMinutes: 5.6 });
      expect(checkHospitalRule(contractions)).toBe(false);
    });

    it("should handle contractions very close together (1 min apart)", () => {
      // Even at 1-minute intervals, 61 contractions would be needed for 1 hour
      // Let's test with 65 contractions at 1-minute intervals = 64 minutes
      const contractions = generateContractions(65, { intervalMinutes: 1 });
      expect(checkHospitalRule(contractions)).toBe(true);
    });

    it("should correctly calculate time span across many contractions", () => {
      // 13 contractions at exactly 5 minutes = 12 gaps = 60 minutes exactly
      const baseTime = new Date("2024-01-15T12:00:00.000Z");
      const contractions: Contraction[] = [];

      for (let i = 0; i < 13; i++) {
        const startTime = new Date(baseTime.getTime() - i * 5 * 60 * 1000);
        contractions.push({
          id: `${i + 1}`,
          startTime: startTime.toISOString(),
          endTime: new Date(startTime.getTime() + 60000).toISOString(),
          duration: 60,
        });
      }

      expect(checkHospitalRule(contractions)).toBe(true);
    });
  });

  describe("real-world scenarios", () => {
    it("should trigger alert for typical labor pattern", () => {
      // Simulate realistic labor: contractions every 4-5 mins, lasting 50-70 secs
      const baseTime = new Date("2024-01-15T13:00:00.000Z");
      const contractions: Contraction[] = [];

      // 15 contractions over ~70 minutes
      const data = [
        { minsBefore: 0, duration: 55 },
        { minsBefore: 4, duration: 60 },
        { minsBefore: 9, duration: 65 },
        { minsBefore: 14, duration: 58 },
        { minsBefore: 18, duration: 62 },
        { minsBefore: 23, duration: 55 },
        { minsBefore: 28, duration: 70 },
        { minsBefore: 33, duration: 60 },
        { minsBefore: 37, duration: 58 },
        { minsBefore: 42, duration: 63 },
        { minsBefore: 47, duration: 55 },
        { minsBefore: 52, duration: 60 },
        { minsBefore: 56, duration: 65 },
        { minsBefore: 61, duration: 58 },
        { minsBefore: 66, duration: 60 },
      ];

      data.forEach((d, i) => {
        const startTime = new Date(
          baseTime.getTime() - d.minsBefore * 60 * 1000
        );
        contractions.push({
          id: `${i + 1}`,
          startTime: startTime.toISOString(),
          endTime: new Date(startTime.getTime() + d.duration * 1000).toISOString(),
          duration: d.duration,
        });
      });

      expect(checkHospitalRule(contractions)).toBe(true);
    });

    it("should not trigger for early labor (irregular pattern)", () => {
      // Early labor: contractions irregular, sometimes >10 mins apart
      const baseTime = new Date("2024-01-15T13:00:00.000Z");
      const contractions: Contraction[] = [];

      const data = [
        { minsBefore: 0, duration: 45 },
        { minsBefore: 8, duration: 50 }, // 8 mins gap - too far
        { minsBefore: 15, duration: 40 }, // 7 mins gap, short duration
        { minsBefore: 28, duration: 55 }, // 13 mins gap - way too far
        { minsBefore: 35, duration: 45 },
      ];

      data.forEach((d, i) => {
        const startTime = new Date(
          baseTime.getTime() - d.minsBefore * 60 * 1000
        );
        contractions.push({
          id: `${i + 1}`,
          startTime: startTime.toISOString(),
          endTime: new Date(startTime.getTime() + d.duration * 1000).toISOString(),
          duration: d.duration,
        });
      });

      expect(checkHospitalRule(contractions)).toBe(false);
    });

    it("should not trigger when pattern starts well but breaks", () => {
      // Good pattern for 30 mins, then a break, then more contractions
      const baseTime = new Date("2024-01-15T13:00:00.000Z");
      const contractions: Contraction[] = [];

      // First 7 contractions: good pattern (30 mins)
      for (let i = 0; i < 7; i++) {
        const startTime = new Date(baseTime.getTime() - i * 5 * 60 * 1000);
        contractions.push({
          id: `${i + 1}`,
          startTime: startTime.toISOString(),
          endTime: new Date(startTime.getTime() + 60000).toISOString(),
          duration: 60,
        });
      }

      // Add a break (15 mins gap from last valid contraction)
      const breakTime = new Date(baseTime.getTime() - 45 * 60 * 1000);
      contractions.push({
        id: "8",
        startTime: breakTime.toISOString(),
        endTime: new Date(breakTime.getTime() + 60000).toISOString(),
        duration: 60,
      });

      expect(checkHospitalRule(contractions)).toBe(false);
    });
  });
});
