import { normalizeEnvMap, formatNormalizeReport } from "./envNormalizer";
import { EnvMap } from "../parser/types";

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { value, comment: undefined, quoted: false });
  }
  return map;
}

describe("normalizeEnvMap", () => {
  it("trims values by default", () => {
    const map = makeMap({ API_KEY: "  abc123  ", HOST: "localhost" });
    const { normalized, changes } = normalizeEnvMap(map);
    expect(normalized.get("API_KEY")?.value).toBe("abc123");
    expect(normalized.get("HOST")?.value).toBe("localhost");
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ key: "API_KEY", field: "value", before: "  abc123  ", after: "abc123" });
  });

  it("trims keys by default", () => {
    const map = makeMap({ " DB_URL ": "postgres://localhost" });
    const { normalized, changes } = normalizeEnvMap(map);
    expect(normalized.has("DB_URL")).toBe(true);
    expect(normalized.has(" DB_URL ")).toBe(false);
    expect(changes[0].field).toBe("key");
  });

  it("uppercases keys when option is set", () => {
    const map = makeMap({ api_key: "secret", host: "localhost" });
    const { normalized, changes } = normalizeEnvMap(map, { uppercaseKeys: true });
    expect(normalized.has("API_KEY")).toBe(true);
    expect(normalized.has("HOST")).toBe(true);
    expect(changes.length).toBe(2);
  });

  it("lowercases keys when option is set", () => {
    const map = makeMap({ API_KEY: "secret" });
    const { normalized } = normalizeEnvMap(map, { lowercaseKeys: true });
    expect(normalized.has("api_key")).toBe(true);
  });

  it("removes empty values when option is set", () => {
    const map = makeMap({ EMPTY: "", HOST: "localhost" });
    const { normalized, removedKeys } = normalizeEnvMap(map, { removeEmptyValues: true });
    expect(normalized.has("EMPTY")).toBe(false);
    expect(normalized.has("HOST")).toBe(true);
    expect(removedKeys).toContain("EMPTY");
  });

  it("collapses internal whitespace when option is set", () => {
    const map = makeMap({ DESC: "hello   world  foo" });
    const { normalized, changes } = normalizeEnvMap(map, { collapseWhitespace: true });
    expect(normalized.get("DESC")?.value).toBe("hello world foo");
    expect(changes[0].field).toBe("value");
  });

  it("returns no changes for already-normalized map", () => {
    const map = makeMap({ API_KEY: "abc", HOST: "localhost" });
    const { changes, removedKeys } = normalizeEnvMap(map);
    expect(changes).toHaveLength(0);
    expect(removedKeys).toHaveLength(0);
  });
});

describe("formatNormalizeReport", () => {
  it("reports no changes when map is clean", () => {
    const map = makeMap({ KEY: "value" });
    const result = normalizeEnvMap(map);
    const report = formatNormalizeReport(result);
    expect(report).toContain("No changes made.");
  });

  it("includes change details in report", () => {
    const map = makeMap({ api_key: "  secret  ", EMPTY: "" });
    const result = normalizeEnvMap(map, { uppercaseKeys: true, trimValues: true, removeEmptyValues: true });
    const report = formatNormalizeReport(result);
    expect(report).toContain("KEY");
    expect(report).toContain("REMOVED");
    expect(report).toContain("Total changes");
  });
});
