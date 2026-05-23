import { describe, it, expect } from "vitest";
import { compareEnvMaps, formatCompareReport } from "./envComparer";
import { EnvMap } from "../parser/types";

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { value, comment: undefined, quoted: false });
  }
  return map;
}

describe("compareEnvMaps", () => {
  it("reports equal keys", () => {
    const left = makeMap({ FOO: "bar", BAZ: "qux" });
    const right = makeMap({ FOO: "bar", BAZ: "qux" });
    const report = compareEnvMaps(left, right);
    expect(report.equal).toBe(2);
    expect(report.different).toBe(0);
    expect(report.missingLeft).toBe(0);
    expect(report.missingRight).toBe(0);
  });

  it("detects different values", () => {
    const left = makeMap({ FOO: "old" });
    const right = makeMap({ FOO: "new" });
    const report = compareEnvMaps(left, right);
    expect(report.different).toBe(1);
    const entry = report.entries.find((e) => e.key === "FOO");
    expect(entry?.leftValue).toBe("old");
    expect(entry?.rightValue).toBe("new");
  });

  it("detects missing right", () => {
    const left = makeMap({ ONLY_LEFT: "val" });
    const right = makeMap({});
    const report = compareEnvMaps(left, right);
    expect(report.missingRight).toBe(1);
    expect(report.entries[0].result).toBe("missing_right");
  });

  it("detects missing left", () => {
    const left = makeMap({});
    const right = makeMap({ ONLY_RIGHT: "val" });
    const report = compareEnvMaps(left, right);
    expect(report.missingLeft).toBe(1);
    expect(report.entries[0].result).toBe("missing_left");
  });

  it("handles mixed scenario", () => {
    const left = makeMap({ A: "1", B: "2", C: "3" });
    const right = makeMap({ A: "1", B: "99", D: "4" });
    const report = compareEnvMaps(left, right);
    expect(report.equal).toBe(1);
    expect(report.different).toBe(1);
    expect(report.missingRight).toBe(1);
    expect(report.missingLeft).toBe(1);
    expect(report.totalKeys).toBe(4);
  });
});

describe("formatCompareReport", () => {
  it("produces a readable summary", () => {
    const left = makeMap({ FOO: "bar", OLD: "val" });
    const right = makeMap({ FOO: "baz", NEW: "val" });
    const report = compareEnvMaps(left, right);
    const output = formatCompareReport(report);
    expect(output).toContain("Compare Report");
    expect(output).toContain("FOO");
    expect(output).toContain("bar");
    expect(output).toContain("baz");
  });
});
