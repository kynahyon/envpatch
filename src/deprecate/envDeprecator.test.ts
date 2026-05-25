import { deprecateEnvKeys, formatDeprecateReport } from "./envDeprecator";
import { DeprecateOptions } from "./types";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("deprecateEnvKeys", () => {
  const options: DeprecateOptions = {
    deprecated: [
      { key: "OLD_API_KEY", reason: "Renamed for clarity", replacedBy: "API_KEY" },
      { key: "LEGACY_DB_URL", reason: "No longer supported" },
      { key: "UNUSED_FLAG", reason: "Feature removed" },
    ],
  };

  it("detects deprecated keys present in the map", () => {
    const env = makeMap({ OLD_API_KEY: "abc", LEGACY_DB_URL: "postgres://", PORT: "3000" });
    const result = deprecateEnvKeys(env, options);
    expect(result.found.map((e) => e.key)).toEqual(["OLD_API_KEY", "LEGACY_DB_URL"]);
    expect(result.notFound).toEqual(["UNUSED_FLAG"]);
  });

  it("keeps deprecated keys in result by default", () => {
    const env = makeMap({ OLD_API_KEY: "abc", PORT: "3000" });
    const result = deprecateEnvKeys(env, options);
    expect(result.result.has("OLD_API_KEY")).toBe(true);
  });

  it("removes deprecated keys when removeDeprecated is true", () => {
    const env = makeMap({ OLD_API_KEY: "abc", LEGACY_DB_URL: "postgres://", PORT: "3000" });
    const result = deprecateEnvKeys(env, { ...options, removeDeprecated: true });
    expect(result.result.has("OLD_API_KEY")).toBe(false);
    expect(result.result.has("LEGACY_DB_URL")).toBe(false);
    expect(result.result.has("PORT")).toBe(true);
  });

  it("returns empty found list when no deprecated keys are present", () => {
    const env = makeMap({ PORT: "3000", HOST: "localhost" });
    const result = deprecateEnvKeys(env, options);
    expect(result.found).toHaveLength(0);
    expect(result.notFound).toHaveLength(3);
  });

  it("does not mutate the original map", () => {
    const env = makeMap({ OLD_API_KEY: "abc" });
    deprecateEnvKeys(env, { ...options, removeDeprecated: true });
    expect(env.has("OLD_API_KEY")).toBe(true);
  });
});

describe("formatDeprecateReport", () => {
  it("reports deprecated keys with replacedBy", () => {
    const env = makeMap({ OLD_API_KEY: "abc" });
    const result = deprecateEnvKeys(env, {
      deprecated: [{ key: "OLD_API_KEY", reason: "Renamed", replacedBy: "API_KEY" }],
    });
    const report = formatDeprecateReport(result);
    expect(report).toContain("OLD_API_KEY");
    expect(report).toContain("API_KEY");
    expect(report).toContain("Renamed");
  });

  it("reports no deprecated keys found", () => {
    const result = { result: new Map(), found: [], notFound: ["OLD_API_KEY"] };
    const report = formatDeprecateReport(result);
    expect(report).toContain("No deprecated keys found");
  });
});
