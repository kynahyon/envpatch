import { buildEnvMap } from "../parser/envMapBuilder";
import { EnvMap } from "../parser/types";
import { flattenEnvMap, formatFlattenReport } from "./envFlattener";

function makeMap(obj: Record<string, string>): EnvMap {
  return buildEnvMap(
    Object.entries(obj).map(([key, value]) => ({ key, value, comment: "" }))
  );
}

describe("flattenEnvMap", () => {
  it("returns unchanged map when no alternative separators are present", () => {
    const env = makeMap({ DB__HOST: "localhost", DB__PORT: "5432" });
    const result = flattenEnvMap(env);
    expect(result.flatMap.get("DB__HOST")).toBe("localhost");
    expect(result.flatMap.get("DB__PORT")).toBe("5432");
    expect(result.renamedKeys).toHaveLength(0);
  });

  it("normalises dot-separated keys to double-underscore", () => {
    const env = makeMap({ "DB.HOST": "localhost", "DB.PORT": "5432" });
    const result = flattenEnvMap(env);
    expect(result.flatMap.has("DB__HOST")).toBe(true);
    expect(result.flatMap.has("DB__PORT")).toBe(true);
    expect(result.renamedKeys).toHaveLength(2);
  });

  it("normalises hyphen-separated keys", () => {
    const env = makeMap({ "APP-NAME": "envpatch" });
    const result = flattenEnvMap(env);
    expect(result.flatMap.has("APP__NAME")).toBe(true);
  });

  it("collapses consecutive separators", () => {
    const env = makeMap({ "DB...HOST": "localhost" });
    const result = flattenEnvMap(env);
    expect(result.flatMap.has("DB__HOST")).toBe(true);
  });

  it("applies prefix when provided", () => {
    const env = makeMap({ HOST: "localhost" });
    const result = flattenEnvMap(env, { prefix: "DB" });
    expect(result.flatMap.has("DB__HOST")).toBe(true);
  });

  it("uppercases keys when option is set", () => {
    const env = makeMap({ "db.host": "localhost" });
    const result = flattenEnvMap(env, { uppercase: true });
    expect(result.flatMap.has("DB__HOST")).toBe(true);
  });

  it("uses a custom separator", () => {
    const env = makeMap({ "DB.HOST": "localhost" });
    const result = flattenEnvMap(env, { separator: "_" });
    expect(result.flatMap.has("DB_HOST")).toBe(true);
  });

  it("tracks originalCount and flattenedCount", () => {
    const env = makeMap({ A: "1", B: "2", C: "3" });
    const result = flattenEnvMap(env);
    expect(result.originalCount).toBe(3);
    expect(result.flattenedCount).toBe(3);
  });
});

describe("formatFlattenReport", () => {
  it("includes renamed key details", () => {
    const env = makeMap({ "DB.HOST": "localhost" });
    const result = flattenEnvMap(env);
    const report = formatFlattenReport(result);
    expect(report).toContain("DB.HOST");
    expect(report).toContain("DB__HOST");
  });

  it("reports no renames when keys are unchanged", () => {
    const env = makeMap({ DB__HOST: "localhost" });
    const result = flattenEnvMap(env);
    const report = formatFlattenReport(result);
    expect(report).toContain("No keys were renamed");
  });
});
