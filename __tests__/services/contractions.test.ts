import {
  deleteContraction,
  countLastHourContractions,
  Contraction,
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
