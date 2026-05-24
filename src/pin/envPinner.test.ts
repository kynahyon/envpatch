import { pinEnvMap, formatPinReport } from "./envPinner";
import { EnvMap } from "../parser/types";

function makeMap(obj: Record<string, string>): EnvMap {
  return new Map(Object.entries(obj));
}

describe("pinEnvMap", () => {
  it("pins specified keys from the pinned map into the result", () => {
    const base = makeMap({ A: "1", B: "2" });
    const pinned = makeMap({ B: "pinned-b", C: "pinned-c" });
    const { result, report } = pinEnvMap(base, pinned, { keys: ["B", "C"] });

    expect(result.get("B")).toBe("pinned-b");
    expect(result.get("C")).toBe("pinned-c");
    expect(report.pinned).toEqual({ B: "pinned-b", C: "pinned-c" });
  });

  it("skips keys already in base when overwrite is false", () => {
    const base = makeMap({ A: "original" });
    const pinned = makeMap({ A: "pinned-a" });
    const { result, report } = pinEnvMap(base, pinned, {
      keys: ["A"],
      overwrite: false,
    });

    expect(result.get("A")).toBe("original");
    expect(report.skipped).toContain("A");
    expect(report.pinned).toEqual({});
  });

  it("overwrites existing keys when overwrite is true", () => {
    const base = makeMap({ A: "original" });
    const pinned = makeMap({ A: "pinned-a" });
    const { result, report } = pinEnvMap(base, pinned, {
      keys: ["A"],
      overwrite: true,
    });

    expect(result.get("A")).toBe("pinned-a");
    expect(report.pinned).toEqual({ A: "pinned-a" });
    expect(report.skipped).toHaveLength(0);
  });

  it("reports missing keys not present in pinned map", () => {
    const base = makeMap({ A: "1" });
    const pinned = makeMap({ B: "2" });
    const { report } = pinEnvMap(base, pinned, { keys: ["X"] });

    expect(report.missing).toContain("X");
    expect(report.pinned).toEqual({});
  });

  it("does not mutate the base map", () => {
    const base = makeMap({ A: "1" });
    const pinned = makeMap({ A: "pinned" });
    pinEnvMap(base, pinned, { keys: ["A"], overwrite: true });
    expect(base.get("A")).toBe("1");
  });
});

describe("formatPinReport", () => {
  it("formats a full pin report", () => {
    const report = {
      pinned: { B: "val" },
      skipped: ["A"],
      missing: ["Z"],
    };
    const output = formatPinReport(report);
    expect(output).toContain("[Pin Report]");
    expect(output).toContain("B=val");
    expect(output).toContain("Skipped");
    expect(output).toContain("Missing");
  });

  it("omits empty sections", () => {
    const report = { pinned: {}, skipped: [], missing: [] };
    const output = formatPinReport(report);
    expect(output).toBe("[Pin Report]");
  });
});
