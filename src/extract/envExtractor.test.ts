import { extractEnvKeys, formatExtractReport } from "./envExtractor";
import { EnvMap } from "../parser/types";

function makeMap(obj: Record<string, string>): EnvMap {
  return new Map(
    Object.entries(obj).map(([k, v]) => [k, { value: v, comment: undefined, quoted: false }])
  );
}

describe("extractEnvKeys", () => {
  const base = makeMap({
    DB_HOST: "localhost",
    DB_PORT: "5432",
    API_KEY: "secret",
    NODE_ENV: "production",
  });

  it("extracts existing keys", () => {
    const result = extractEnvKeys(base, { keys: ["DB_HOST", "DB_PORT"] });
    expect(result.found).toEqual(["DB_HOST", "DB_PORT"]);
    expect(result.missing).toEqual([]);
    expect(result.extracted.size).toBe(2);
    expect(result.extracted.get("DB_HOST")?.value).toBe("localhost");
  });

  it("reports missing keys", () => {
    const result = extractEnvKeys(base, { keys: ["DB_HOST", "UNKNOWN"] });
    expect(result.found).toEqual(["DB_HOST"]);
    expect(result.missing).toEqual(["UNKNOWN"]);
    expect(result.extracted.size).toBe(1);
  });

  it("returns empty extracted map when no keys match", () => {
    const result = extractEnvKeys(base, { keys: ["FOO", "BAR"] });
    expect(result.extracted.size).toBe(0);
    expect(result.missing).toEqual(["FOO", "BAR"]);
    expect(result.found).toEqual([]);
  });

  it("throws in strict mode when keys are missing", () => {
    expect(() =>
      extractEnvKeys(base, { keys: ["DB_HOST", "MISSING_KEY"], strict: true })
    ).toThrow(/missing required keys/);
  });

  it("does not throw in strict mode when all keys present", () => {
    expect(() =>
      extractEnvKeys(base, { keys: ["DB_HOST", "API_KEY"], strict: true })
    ).not.toThrow();
  });

  it("handles empty keys list", () => {
    const result = extractEnvKeys(base, { keys: [] });
    expect(result.extracted.size).toBe(0);
    expect(result.found).toEqual([]);
    expect(result.missing).toEqual([]);
  });
});

describe("formatExtractReport", () => {
  it("includes found and missing counts", () => {
    const base = makeMap({ A: "1", B: "2" });
    const result = extractEnvKeys(base, { keys: ["A", "C"] });
    const report = formatExtractReport(result);
    expect(report).toContain("[Extract Report]");
    expect(report).toContain("Found    : 1");
    expect(report).toContain("Missing  : 1");
    expect(report).toContain("+ A");
    expect(report).toContain("- C");
  });
});
