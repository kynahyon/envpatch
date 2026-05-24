import { applyMergeStrategy, formatMergeStrategyReport } from "./envMergeStrategy";
import { MergeStrategyResult } from "./types";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("applyMergeStrategy", () => {
  const base = makeMap({ A: "1", B: "base", C: "shared" });
  const incoming = makeMap({ B: "incoming", C: "shared", D: "4" });

  it("ours: prefers base on conflict", () => {
    const result = applyMergeStrategy(base, incoming, { strategy: "ours" });
    expect(result.merged.get("B")).toBe("base");
    expect(result.resolved).toContain("B");
  });

  it("theirs: prefers incoming on conflict", () => {
    const result = applyMergeStrategy(base, incoming, { strategy: "theirs" });
    expect(result.merged.get("B")).toBe("incoming");
  });

  it("union: includes all keys", () => {
    const result = applyMergeStrategy(base, incoming, { strategy: "union" });
    expect(result.merged.has("A")).toBe(true);
    expect(result.merged.has("D")).toBe(true);
  });

  it("intersection: only includes shared keys", () => {
    const result = applyMergeStrategy(base, incoming, { strategy: "intersection" });
    expect(result.merged.has("A")).toBe(false);
    expect(result.merged.has("D")).toBe(false);
    expect(result.merged.has("B")).toBe(true);
    expect(result.merged.has("C")).toBe(true);
  });

  it("identical keys are tracked", () => {
    const result = applyMergeStrategy(base, incoming, { strategy: "union" });
    expect(result.identical).toContain("C");
  });

  it("preferBaseKeys overrides strategy", () => {
    const result = applyMergeStrategy(base, incoming, {
      strategy: "theirs",
      preferBaseKeys: ["B"],
    });
    expect(result.merged.get("B")).toBe("base");
  });

  it("preferIncomingKeys overrides strategy", () => {
    const result = applyMergeStrategy(base, incoming, {
      strategy: "ours",
      preferIncomingKeys: ["B"],
    });
    expect(result.merged.get("B")).toBe("incoming");
  });
});

describe("formatMergeStrategyReport", () => {
  it("includes strategy name and counts", () => {
    const base = makeMap({ X: "1", Y: "old" });
    const incoming = makeMap({ Y: "new", Z: "3" });
    const result = applyMergeStrategy(base, incoming, { strategy: "theirs" });
    const report = formatMergeStrategyReport(result);
    expect(report).toContain("theirs");
    expect(report).toContain("Conflicts resolved: 1");
    expect(report).toContain("Y");
  });
});
