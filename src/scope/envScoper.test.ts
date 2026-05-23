import { scopeEnvMap, formatScopeReport } from "./envScoper";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("scopeEnvMap", () => {
  const base = makeMap({
    APP_NAME: "myapp",
    APP_ENV: "production",
    DB_HOST: "localhost",
    DB_PORT: "5432",
    SECRET_KEY: "abc123",
  });

  it("includes only listed keys in include mode", () => {
    const result = scopeEnvMap(base, { keys: ["APP_NAME", "APP_ENV"], mode: "include" });
    expect(result.scoped.size).toBe(2);
    expect(result.scoped.has("APP_NAME")).toBe(true);
    expect(result.scoped.has("APP_ENV")).toBe(true);
    expect(result.excluded.has("DB_HOST")).toBe(true);
  });

  it("excludes listed keys in exclude mode", () => {
    const result = scopeEnvMap(base, { keys: ["SECRET_KEY"], mode: "exclude" });
    expect(result.scoped.has("SECRET_KEY")).toBe(false);
    expect(result.excluded.has("SECRET_KEY")).toBe(true);
    expect(result.scoped.size).toBe(4);
  });

  it("returns empty scoped map when no keys match in include mode", () => {
    const result = scopeEnvMap(base, { keys: ["NONEXISTENT"], mode: "include" });
    expect(result.scoped.size).toBe(0);
    expect(result.excluded.size).toBe(5);
  });

  it("returns unchanged scoped map when no keys match in exclude mode", () => {
    const result = scopeEnvMap(base, { keys: ["NONEXISTENT"], mode: "exclude" });
    expect(result.scoped.size).toBe(5);
    expect(result.excluded.size).toBe(0);
  });

  it("reports correct mode in result", () => {
    const result = scopeEnvMap(base, { keys: ["APP_NAME"], mode: "include" });
    expect(result.mode).toBe("include");
  });
});

describe("formatScopeReport", () => {
  it("formats a readable report", () => {
    const base = makeMap({ A: "1", B: "2", C: "3" });
    const result = scopeEnvMap(base, { keys: ["A", "B"], mode: "include" });
    const report = formatScopeReport(result);
    expect(report).toContain("include");
    expect(report).toContain("A");
    expect(report).toContain("B");
    expect(report).toContain("C");
  });

  it("shows (none) when no keys are scoped", () => {
    const base = makeMap({ X: "1" });
    const result = scopeEnvMap(base, { keys: ["X"], mode: "exclude" });
    const report = formatScopeReport(result);
    expect(report).toContain("(none)");
  });
});
