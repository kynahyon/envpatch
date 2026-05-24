import { sortEnvMap, formatSortReport } from "./envSorter";
import { EnvMap } from "../parser/types";

function makeMap(obj: Record<string, string>): EnvMap {
  return new Map(Object.entries(obj));
}

describe("sortEnvMap", () => {
  it("sorts keys in ascending order by default", () => {
    const env = makeMap({ ZEBRA: "z", APPLE: "a", MANGO: "m" });
    const { sorted } = sortEnvMap(env);
    expect(Array.from(sorted.keys())).toEqual(["APPLE", "MANGO", "ZEBRA"]);
  });

  it("sorts keys in descending order", () => {
    const env = makeMap({ ZEBRA: "z", APPLE: "a", MANGO: "m" });
    const { sorted } = sortEnvMap(env, { order: "desc" });
    expect(Array.from(sorted.keys())).toEqual(["ZEBRA", "MANGO", "APPLE"]);
  });

  it("preserves values after sorting", () => {
    const env = makeMap({ B: "beta", A: "alpha" });
    const { sorted } = sortEnvMap(env);
    expect(sorted.get("A")).toBe("alpha");
    expect(sorted.get("B")).toBe("beta");
  });

  it("groups by prefix and sorts within groups", () => {
    const env = makeMap({
      DB_PORT: "5432",
      APP_NAME: "test",
      DB_HOST: "localhost",
      APP_ENV: "dev",
    });
    const { sorted } = sortEnvMap(env, { groupByPrefix: true });
    const keys = Array.from(sorted.keys());
    expect(keys).toEqual(["APP_ENV", "APP_NAME", "DB_HOST", "DB_PORT"]);
  });

  it("groups by prefix descending", () => {
    const env = makeMap({
      DB_PORT: "5432",
      APP_NAME: "test",
      DB_HOST: "localhost",
    });
    const { sorted } = sortEnvMap(env, { groupByPrefix: true, order: "desc" });
    const keys = Array.from(sorted.keys());
    expect(keys[0]).toBe("DB_PORT");
  });

  it("returns correct metadata", () => {
    const env = makeMap({ B: "2", A: "1" });
    const result = sortEnvMap(env, { order: "desc" });
    expect(result.order).toBe("desc");
    expect(result.keyCount).toBe(2);
    expect(result.groupedByPrefix).toBe(false);
  });

  it("handles empty map", () => {
    const env = makeMap({});
    const { sorted } = sortEnvMap(env);
    expect(sorted.size).toBe(0);
  });
});

describe("formatSortReport", () => {
  it("includes sort order and key count", () => {
    const env = makeMap({ B: "2", A: "1" });
    const result = sortEnvMap(env);
    const report = formatSortReport(result);
    expect(report).toContain("Order: asc");
    expect(report).toContain("Keys sorted: 2");
    expect(report).toContain("A");
    expect(report).toContain("B");
  });
});
