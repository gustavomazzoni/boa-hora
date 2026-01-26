import {
  deleteContraction,
  countLastHourContractions,
  createContraction,
  getEffectiveDuration,
  shouldAutoStop,
  Contraction,
  MAX_CONTRACTION_DURATION_SECONDS,
} from "@/services/contractions";

describe("deleteContraction", () => {
  const mockContractions: Contraction[] = [
    {
      id: "1",
      startTime: "2024-01-15T10:00:00.000Z",
      endTime: "2024-01-15T10:01:00.000Z",
      duration: 60,
    },
    {
      id: "2",
      startTime: "2024-01-15T10:05:00.000Z",
      endTime: "2024-01-15T10:06:00.000Z",
      duration: 60,
    },
    {
      id: "3",
      startTime: "2024-01-15T10:10:00.000Z",
      endTime: "2024-01-15T10:11:30.000Z",
      duration: 90,
    },
  ];

  it("should remove contraction by ID", () => {
    const result = deleteContraction(mockContractions, "2");

    expect(result).toHaveLength(2);
    expect(result.find((c) => c.id === "2")).toBeUndefined();
    expect(result.find((c) => c.id === "1")).toBeDefined();
    expect(result.find((c) => c.id === "3")).toBeDefined();
  });

  it("should return original array if ID not found", () => {
    const result = deleteContraction(mockContractions, "999");

    expect(result).toHaveLength(3);
    expect(result).toEqual(mockContractions);
  });

  it("should handle empty array", () => {
    const result = deleteContraction([], "1");

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it("should handle null ID", () => {
    const result = deleteContraction(mockContractions, null);

    expect(result).toHaveLength(3);
    expect(result).toEqual(mockContractions);
  });

  it("should handle undefined ID", () => {
    const result = deleteContraction(mockContractions, undefined);

    expect(result).toHaveLength(3);
    expect(result).toEqual(mockContractions);
  });

  it("should not mutate original array", () => {
    const original = [...mockContractions];
    deleteContraction(mockContractions, "2");

    expect(mockContractions).toHaveLength(3);
    expect(mockContractions).toEqual(original);
  });

  it("should handle single item array", () => {
    const singleItem: Contraction[] = [
      {
        id: "1",
        startTime: "2024-01-15T10:00:00.000Z",
        endTime: "2024-01-15T10:01:00.000Z",
        duration: 60,
      },
    ];

    const result = deleteContraction(singleItem, "1");

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it("should handle deleting first item", () => {
    const result = deleteContraction(mockContractions, "1");

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("2");
    expect(result[1].id).toBe("3");
  });

  it("should handle deleting last item", () => {
    const result = deleteContraction(mockContractions, "3");

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("1");
    expect(result[1].id).toBe("2");
  });

  it("should handle null contractions array", () => {
    const result = deleteContraction(null as unknown as Contraction[], "1");

    expect(result).toEqual([]);
  });

  it("should handle undefined contractions array", () => {
    const result = deleteContraction(
      undefined as unknown as Contraction[],
      "1"
    );

    expect(result).toEqual([]);
  });
});

describe("countLastHourContractions", () => {
  const NOW = new Date("2024-01-15T12:00:00.000Z");

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should count only contractions within the last 60 minutes", () => {
    const contractions: Contraction[] = [
      {
        id: "1",
        startTime: "2024-01-15T11:30:00.000Z", // 30 mins ago - should count
        endTime: "2024-01-15T11:31:00.000Z",
        duration: 60,
      },
      {
        id: "2",
        startTime: "2024-01-15T11:00:00.000Z", // 60 mins ago - should count
        endTime: "2024-01-15T11:01:00.000Z",
        duration: 60,
      },
      {
        id: "3",
        startTime: "2024-01-15T10:59:00.000Z", // 61 mins ago - should NOT count
        endTime: "2024-01-15T11:00:00.000Z",
        duration: 60,
      },
    ];

    const result = countLastHourContractions(contractions);

    expect(result).toBe(2);
  });

  it("should return 0 for empty array", () => {
    const result = countLastHourContractions([]);

    expect(result).toBe(0);
  });

  it("should return 0 when all contractions are older than 60 minutes", () => {
    const contractions: Contraction[] = [
      {
        id: "1",
        startTime: "2024-01-15T10:00:00.000Z", // 2 hours ago
        endTime: "2024-01-15T10:01:00.000Z",
        duration: 60,
      },
      {
        id: "2",
        startTime: "2024-01-15T09:00:00.000Z", // 3 hours ago
        endTime: "2024-01-15T09:01:00.000Z",
        duration: 60,
      },
    ];

    const result = countLastHourContractions(contractions);

    expect(result).toBe(0);
  });

  it("should count all contractions when all are within the last hour", () => {
    const contractions: Contraction[] = [
      {
        id: "1",
        startTime: "2024-01-15T11:50:00.000Z", // 10 mins ago
        endTime: "2024-01-15T11:51:00.000Z",
        duration: 60,
      },
      {
        id: "2",
        startTime: "2024-01-15T11:40:00.000Z", // 20 mins ago
        endTime: "2024-01-15T11:41:00.000Z",
        duration: 60,
      },
      {
        id: "3",
        startTime: "2024-01-15T11:30:00.000Z", // 30 mins ago
        endTime: "2024-01-15T11:31:00.000Z",
        duration: 60,
      },
    ];

    const result = countLastHourContractions(contractions);

    expect(result).toBe(3);
  });

  it("should include contraction at exactly 60 minutes ago", () => {
    const contractions: Contraction[] = [
      {
        id: "1",
        startTime: "2024-01-15T11:00:00.000Z", // exactly 60 mins ago
        endTime: "2024-01-15T11:01:00.000Z",
        duration: 60,
      },
    ];

    const result = countLastHourContractions(contractions);

    expect(result).toBe(1);
  });

  it("should exclude contraction at 61 minutes ago", () => {
    const contractions: Contraction[] = [
      {
        id: "1",
        startTime: "2024-01-15T10:59:00.000Z", // 61 mins ago
        endTime: "2024-01-15T11:00:00.000Z",
        duration: 60,
      },
    ];

    const result = countLastHourContractions(contractions);

    expect(result).toBe(0);
  });

  it("should handle contractions from just now", () => {
    const contractions: Contraction[] = [
      {
        id: "1",
        startTime: "2024-01-15T12:00:00.000Z", // exactly now (0 mins ago)
        endTime: "2024-01-15T12:01:00.000Z",
        duration: 60,
      },
    ];

    const result = countLastHourContractions(contractions);

    expect(result).toBe(1);
  });
});

describe("getEffectiveDuration", () => {
  it("should return actual duration when under 90 seconds", () => {
    const startTime = "2024-01-15T12:00:00.000Z";
    const endTime = "2024-01-15T12:00:45.000Z"; // 45 seconds later

    const result = getEffectiveDuration(startTime, endTime);

    expect(result).toBe(45);
  });

  it("should return exactly 90 seconds when duration is exactly 90 seconds", () => {
    const startTime = "2024-01-15T12:00:00.000Z";
    const endTime = "2024-01-15T12:01:30.000Z"; // 90 seconds later

    const result = getEffectiveDuration(startTime, endTime);

    expect(result).toBe(90);
  });

  it("should cap duration at 90 seconds when actual duration exceeds 90 seconds", () => {
    const startTime = "2024-01-15T12:00:00.000Z";
    const endTime = "2024-01-15T12:05:00.000Z"; // 5 minutes (300 seconds) later

    const result = getEffectiveDuration(startTime, endTime);

    expect(result).toBe(90);
  });

  it("should cap very long durations at 90 seconds", () => {
    const startTime = "2024-01-15T12:00:00.000Z";
    const endTime = "2024-01-15T14:00:00.000Z"; // 2 hours later

    const result = getEffectiveDuration(startTime, endTime);

    expect(result).toBe(90);
  });

  it("should return 0 for same start and end time", () => {
    const startTime = "2024-01-15T12:00:00.000Z";
    const endTime = "2024-01-15T12:00:00.000Z";

    const result = getEffectiveDuration(startTime, endTime);

    expect(result).toBe(0);
  });

  it("should handle milliseconds correctly (floor to seconds)", () => {
    const startTime = "2024-01-15T12:00:00.000Z";
    const endTime = "2024-01-15T12:00:30.999Z"; // 30.999 seconds

    const result = getEffectiveDuration(startTime, endTime);

    expect(result).toBe(30);
  });
});

describe("createContraction", () => {
  it("should create contraction with actual duration when under 90 seconds", () => {
    const startTime = "2024-01-15T12:00:00.000Z";
    const endTime = "2024-01-15T12:01:00.000Z"; // 60 seconds

    const result = createContraction(startTime, endTime);

    expect(result.startTime).toBe(startTime);
    expect(result.endTime).toBe(endTime);
    expect(result.duration).toBe(60);
    expect(result.id).toBeDefined();
  });

  it("should cap duration at 90 seconds and adjust endTime", () => {
    const startTime = "2024-01-15T12:00:00.000Z";
    const endTime = "2024-01-15T12:05:00.000Z"; // 5 minutes later

    const result = createContraction(startTime, endTime);

    expect(result.startTime).toBe(startTime);
    expect(result.duration).toBe(90);
    // endTime should be adjusted to startTime + 90 seconds
    expect(result.endTime).toBe("2024-01-15T12:01:30.000Z");
  });

  it("should generate unique IDs", () => {
    const startTime = "2024-01-15T12:00:00.000Z";
    const endTime = "2024-01-15T12:01:00.000Z";

    const result1 = createContraction(startTime, endTime);
    // Small delay to ensure different timestamp
    const result2 = createContraction(startTime, endTime);

    expect(result1.id).toBeDefined();
    expect(result2.id).toBeDefined();
  });

  it("should not modify endTime when duration is exactly 90 seconds", () => {
    const startTime = "2024-01-15T12:00:00.000Z";
    const endTime = "2024-01-15T12:01:30.000Z"; // exactly 90 seconds

    const result = createContraction(startTime, endTime);

    expect(result.duration).toBe(90);
    expect(result.endTime).toBe(endTime);
  });
});

describe("shouldAutoStop", () => {
  const NOW = new Date("2024-01-15T12:00:00.000Z");

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return false when less than 90 seconds have elapsed", () => {
    // Started 60 seconds ago
    const startTime = "2024-01-15T11:59:00.000Z";

    const result = shouldAutoStop(startTime);

    expect(result).toBe(false);
  });

  it("should return true when exactly 90 seconds have elapsed", () => {
    // Started exactly 90 seconds ago
    const startTime = "2024-01-15T11:58:30.000Z";

    const result = shouldAutoStop(startTime);

    expect(result).toBe(true);
  });

  it("should return true when more than 90 seconds have elapsed", () => {
    // Started 2 minutes ago
    const startTime = "2024-01-15T11:58:00.000Z";

    const result = shouldAutoStop(startTime);

    expect(result).toBe(true);
  });

  it("should return true when contraction started hours ago", () => {
    // Started 2 hours ago (user forgot to stop)
    const startTime = "2024-01-15T10:00:00.000Z";

    const result = shouldAutoStop(startTime);

    expect(result).toBe(true);
  });

  it("should return false when contraction just started", () => {
    // Started just now
    const startTime = "2024-01-15T12:00:00.000Z";

    const result = shouldAutoStop(startTime);

    expect(result).toBe(false);
  });

  it("should return false at 89 seconds", () => {
    // Started 89 seconds ago
    const startTime = "2024-01-15T11:58:31.000Z";

    const result = shouldAutoStop(startTime);

    expect(result).toBe(false);
  });
});

describe("MAX_CONTRACTION_DURATION_SECONDS", () => {
  it("should be 90 seconds", () => {
    expect(MAX_CONTRACTION_DURATION_SECONDS).toBe(90);
  });
});
