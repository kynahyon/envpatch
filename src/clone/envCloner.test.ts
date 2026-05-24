import { cloneEnvMap, formatCloneReport } from "./envCloner";
import { EnvMap } from "../parser/types";

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { value, comment: undefined, quoted: false });
  }
  return map;
}

describe("cloneEnvMap", () => {
  it("clones all keys when no options provided", () => {
    const source = makeMap({ FOO: "1", BAR: "2" });
    const { cloned, skipped, renamed } = cloneEnvMap(source);
    expect(cloned.size).toBe(2);
    expect(cloned.get("FOO")?.value).toBe("1");
    expect(skipped).toHaveLength(0);
    expect(renamed).toHaveLength(0);
  });

  it("filters keys by prefix", () => {
    const source = makeMap({ APP_FOO: "1", APP_BAR: "2", DB_HOST: "localhost" });
    const { cloned, skipped } = cloneEnvMap(source, { prefixes: ["APP_"] });
    expect(cloned.size).toBe(2);
    expect(skipped).toContain("DB_HOST");
  });

  it("strips prefix from cloned keys", () => {
    const source = makeMap({ APP_FOO: "hello", APP_BAR: "world" });
    const { cloned, renamed } = cloneEnvMap(source, { stripPrefix: "APP_" });
    expect(cloned.has("FOO")).toBe(true);
    expect(cloned.has("BAR")).toBe(true);
    expect(renamed).toHaveLength(2);
  });

  it("adds prefix to cloned keys", () => {
    const source = makeMap({ FOO: "1" });
    const { cloned } = cloneEnvMap(source, { addPrefix: "CLONE_" });
    expect(cloned.has("CLONE_FOO")).toBe(true);
  });

  it("applies overrides to existing keys", () => {
    const source = makeMap({ FOO: "original" });
    const { cloned } = cloneEnvMap(source, { overrides: { FOO: "overridden" } });
    expect(cloned.get("FOO")?.value).toBe("overridden");
  });

  it("adds new keys from overrides not in source", () => {
    const source = makeMap({ FOO: "1" });
    const { cloned } = cloneEnvMap(source, { overrides: { NEW_KEY: "new" } });
    expect(cloned.has("NEW_KEY")).toBe(true);
    expect(cloned.get("NEW_KEY")?.value).toBe("new");
  });

  it("preserves entry metadata in clone", () => {
    const map: EnvMap = new Map();
    map.set("FOO", { value: "bar", comment: "a comment", quoted: true });
    const { cloned } = cloneEnvMap(map);
    expect(cloned.get("FOO")?.comment).toBe("a comment");
    expect(cloned.get("FOO")?.quoted).toBe(true);
  });
});

describe("formatCloneReport", () => {
  it("includes cloned, skipped, and renamed counts", () => {
    const source = makeMap({ APP_FOO: "1", DB_HOST: "localhost" });
    const result = cloneEnvMap(source, { prefixes: ["APP_"], stripPrefix: "APP_" });
    const report = formatCloneReport(result);
    expect(report).toContain("[Clone Report]");
    expect(report).toContain("Cloned keys");
    expect(report).toContain("Skipped keys");
    expect(report).toContain("DB_HOST");
    expect(report).toContain("APP_FOO -> FOO");
  });
});
