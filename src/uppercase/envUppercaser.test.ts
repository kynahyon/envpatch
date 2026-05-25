import { uppercaseEnvKeys, formatUppercaseReport } from "./envUppercaser";
import { EnvMap } from "../parser/types";

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { key, value, comment: undefined });
  }
  return map;
}

describe("uppercaseEnvKeys", () => {
  it("uppercases lowercase keys", () => {
    const map = makeMap({ db_host: "localhost", db_port: "5432" });
    const { result, uppercased, skipped } = uppercaseEnvKeys(map);
    expect(result.has("DB_HOST")).toBe(true);
    expect(result.has("DB_PORT")).toBe(true);
    expect(result.has("db_host")).toBe(false);
    expect(uppercased).toContain("db_host");
    expect(uppercased).toContain("db_port");
    expect(skipped).toHaveLength(0);
  });

  it("skips already uppercase keys", () => {
    const map = makeMap({ DB_HOST: "localhost", DB_PORT: "5432" });
    const { result, uppercased, skipped } = uppercaseEnvKeys(map);
    expect(result.has("DB_HOST")).toBe(true);
    expect(uppercased).toHaveLength(0);
    expect(skipped).toContain("DB_HOST");
    expect(skipped).toContain("DB_PORT");
  });

  it("handles mixed case keys", () => {
    const map = makeMap({ Api_Key: "secret", BASE_URL: "http://example.com" });
    const { result, uppercased, skipped } = uppercaseEnvKeys(map);
    expect(result.has("API_KEY")).toBe(true);
    expect(result.has("BASE_URL")).toBe(true);
    expect(uppercased).toContain("Api_Key");
    expect(skipped).toContain("BASE_URL");
  });

  it("preserves value when uppercasing key", () => {
    const map = makeMap({ app_name: "myapp" });
    const { result } = uppercaseEnvKeys(map);
    expect(result.get("APP_NAME")?.value).toBe("myapp");
    expect(result.get("APP_NAME")?.key).toBe("APP_NAME");
  });

  it("handles empty map", () => {
    const map = makeMap({});
    const { result, uppercased, skipped } = uppercaseEnvKeys(map);
    expect(result.size).toBe(0);
    expect(uppercased).toHaveLength(0);
    expect(skipped).toHaveLength(0);
  });

  it("last value wins on collision after uppercasing", () => {
    const map: EnvMap = new Map();
    map.set("key", { key: "key", value: "first", comment: undefined });
    map.set("KEY", { key: "KEY", value: "second", comment: undefined });
    const { result } = uppercaseEnvKeys(map);
    expect(result.get("KEY")?.value).toBe("second");
  });
});

describe("formatUppercaseReport", () => {
  it("formats a report with uppercased and skipped keys", () => {
    const map = makeMap({ db_host: "localhost", DB_PORT: "5432" });
    const report = uppercaseEnvKeys(map);
    const text = formatUppercaseReport(report);
    expect(text).toContain("Uppercased");
    expect(text).toContain("db_host -> DB_HOST");
    expect(text).toContain("Already uppercase");
    expect(text).toContain("DB_PORT");
  });

  it("formats report for empty map", () => {
    const map = makeMap({});
    const report = uppercaseEnvKeys(map);
    const text = formatUppercaseReport(report);
    expect(text).toContain("No keys found.");
  });
});
