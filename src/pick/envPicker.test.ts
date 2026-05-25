import { pickEnvKeys, formatPickReport } from "./envPicker";
import { EnvMap } from "../parser/types";

function makeMap(obj: Record<string, string>): EnvMap {
  return new Map(Object.entries(obj));
}

describe("pickEnvKeys", () => {
  const env = makeMap({
    DB_HOST: "localhost",
    DB_PORT: "5432",
    API_KEY: "secret",
    APP_NAME: "myapp",
  });

  it("picks only the specified keys", () => {
    const result = pickEnvKeys(env, { keys: ["DB_HOST", "API_KEY"] });
    expect(result.picked.size).toBe(2);
    expect(result.picked.get("DB_HOST")).toBe("localhost");
    expect(result.picked.get("API_KEY")).toBe("secret");
    expect(result.found).toEqual(["DB_HOST", "API_KEY"]);
    expect(result.missing).toEqual([]);
  });

  it("tracks missing keys without strict mode", () => {
    const result = pickEnvKeys(env, { keys: ["DB_HOST", "MISSING_KEY"] });
    expect(result.found).toEqual(["DB_HOST"]);
    expect(result.missing).toEqual(["MISSING_KEY"]);
    expect(result.picked.size).toBe(1);
  });

  it("throws in strict mode when a key is missing", () => {
    expect(() =>
      pickEnvKeys(env, { keys: ["DB_HOST", "NOT_THERE"], strict: true })
    ).toThrow(/NOT_THERE/);
  });

  it("returns empty map for empty keys list", () => {
    const result = pickEnvKeys(env, { keys: [] });
    expect(result.picked.size).toBe(0);
    expect(result.found).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  it("picks all keys when all are present", () => {
    const result = pickEnvKeys(env, {
      keys: ["DB_HOST", "DB_PORT", "API_KEY", "APP_NAME"],
    });
    expect(result.found.length).toBe(4);
    expect(result.missing.length).toBe(0);
  });
});

describe("formatPickReport", () => {
  it("includes found and missing keys in report", () => {
    const env = makeMap({ FOO: "bar", BAZ: "qux" });
    const result = pickEnvKeys(env, { keys: ["FOO", "MISSING"] });
    const report = formatPickReport(result);
    expect(report).toContain("[Pick Report]");
    expect(report).toContain("+ FOO");
    expect(report).toContain("- MISSING");
    expect(report).toContain("Total picked: 1");
  });

  it("omits missing section when all keys found", () => {
    const env = makeMap({ A: "1", B: "2" });
    const result = pickEnvKeys(env, { keys: ["A", "B"] });
    const report = formatPickReport(result);
    expect(report).not.toContain("Missing");
  });
});
