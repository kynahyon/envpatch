import { addPrefix, removePrefix, formatPrefixReport } from "./envPrefixer";
import { EnvMap } from "../parser/types";

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { value, comment: undefined });
  }
  return map;
}

describe("addPrefix", () => {
  it("adds prefix to all keys", () => {
    const map = makeMap({ HOST: "localhost", PORT: "3000" });
    const { prefixed, added, skipped } = addPrefix(map, { prefix: "APP" });
    expect(prefixed.has("APP_HOST")).toBe(true);
    expect(prefixed.has("APP_PORT")).toBe(true);
    expect(prefixed.has("HOST")).toBe(false);
    expect(added).toEqual(["APP_HOST", "APP_PORT"]);
    expect(skipped).toHaveLength(0);
  });

  it("skips keys that already have the prefix", () => {
    const map = makeMap({ APP_HOST: "localhost", PORT: "3000" });
    const { prefixed, skipped } = addPrefix(map, { prefix: "APP" });
    expect(prefixed.has("APP_HOST")).toBe(true);
    expect(prefixed.has("APP_PORT")).toBe(true);
    expect(skipped).toContain("APP_HOST");
  });

  it("respects custom separator", () => {
    const map = makeMap({ HOST: "localhost" });
    const { prefixed } = addPrefix(map, { prefix: "APP", separator: "." });
    expect(prefixed.has("APP.HOST")).toBe(true);
  });

  it("skips collision when overwrite is false", () => {
    const map = makeMap({ HOST: "localhost", APP_HOST: "other" });
    const { skipped } = addPrefix(map, { prefix: "APP", overwrite: false });
    expect(skipped).toContain("HOST");
  });

  it("overwrites collision when overwrite is true", () => {
    const map = makeMap({ HOST: "newval", APP_HOST: "old" });
    const { prefixed } = addPrefix(map, { prefix: "APP", overwrite: true });
    expect(prefixed.get("APP_HOST")?.value).toBe("newval");
  });
});

describe("removePrefix", () => {
  it("strips prefix from matching keys", () => {
    const map = makeMap({ APP_HOST: "localhost", APP_PORT: "3000", OTHER: "x" });
    const result = removePrefix(map, { prefix: "APP" });
    expect(result.has("HOST")).toBe(true);
    expect(result.has("PORT")).toBe(true);
    expect(result.has("OTHER")).toBe(true);
    expect(result.has("APP_HOST")).toBe(false);
  });

  it("leaves non-matching keys unchanged", () => {
    const map = makeMap({ UNRELATED: "val" });
    const result = removePrefix(map, { prefix: "APP" });
    expect(result.has("UNRELATED")).toBe(true);
  });
});

describe("formatPrefixReport", () => {
  it("includes added and skipped counts", () => {
    const map = makeMap({ HOST: "localhost" });
    const result = addPrefix(map, { prefix: "APP" });
    const report = formatPrefixReport(result, "APP");
    expect(report).toContain("APP");
    expect(report).toContain("Added");
    expect(report).toContain("APP_HOST");
  });
});
