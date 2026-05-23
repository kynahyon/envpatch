import { filterEnvMap, formatFilterReport } from "./envFilter";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("filterEnvMap", () => {
  const base = makeMap({
    DB_HOST: "localhost",
    DB_PORT: "5432",
    AWS_KEY: "abc",
    APP_NAME: "envpatch",
    DEBUG: "true",
  });

  it("includes only specified keys", () => {
    const { filtered, keptKeys, removedKeys } = filterEnvMap(base, {
      keys: ["DEBUG", "APP_NAME"],
      mode: "include",
    });
    expect([...filtered.keys()].sort()).toEqual(["APP_NAME", "DEBUG"]);
    expect(keptKeys.sort()).toEqual(["APP_NAME", "DEBUG"]);
    expect(removedKeys).toHaveLength(3);
  });

  it("excludes specified keys", () => {
    const { filtered } = filterEnvMap(base, {
      keys: ["DEBUG"],
      mode: "exclude",
    });
    expect(filtered.has("DEBUG")).toBe(false);
    expect(filtered.size).toBe(4);
  });

  it("includes keys by prefix", () => {
    const { filtered } = filterEnvMap(base, {
      prefixes: ["DB_"],
      mode: "include",
    });
    expect([...filtered.keys()].sort()).toEqual(["DB_HOST", "DB_PORT"]);
  });

  it("excludes keys by prefix", () => {
    const { filtered } = filterEnvMap(base, {
      prefixes: ["AWS_", "DB_"],
      mode: "exclude",
    });
    expect([...filtered.keys()].sort()).toEqual(["APP_NAME", "DEBUG"]);
  });

  it("combines keys and prefixes in include mode", () => {
    const { filtered } = filterEnvMap(base, {
      keys: ["DEBUG"],
      prefixes: ["AWS_"],
      mode: "include",
    });
    expect([...filtered.keys()].sort()).toEqual(["AWS_KEY", "DEBUG"]);
  });

  it("returns empty map when no matches in include mode", () => {
    const { filtered } = filterEnvMap(base, {
      keys: ["NONEXISTENT"],
      mode: "include",
    });
    expect(filtered.size).toBe(0);
  });

  it("returns full map when no options provided with exclude mode", () => {
    const { filtered } = filterEnvMap(base, { mode: "exclude" });
    expect(filtered.size).toBe(base.size);
  });
});

describe("formatFilterReport", () => {
  it("formats a readable report", () => {
    const result = filterEnvMap(
      makeMap({ A: "1", B: "2", C: "3" }),
      { keys: ["A", "B"], mode: "include" }
    );
    const report = formatFilterReport(result);
    expect(report).toContain("Filter Report");
    expect(report).toContain("Kept:");
    expect(report).toContain("Removed:");
  });
});
