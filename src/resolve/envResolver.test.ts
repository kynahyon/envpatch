import { resolveEnvMap, formatResolveReport } from "./envResolver";
import { EnvMap } from "../parser/types";

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { key, value, comment: undefined, raw: `${key}=${value}` });
  }
  return map;
}

describe("resolveEnvMap", () => {
  it("returns base map unchanged when no options provided", () => {
    const base = makeMap({ FOO: "foo", BAR: "bar" });
    const { resolved, missing, overridden, fromFallback } = resolveEnvMap(base);
    expect(resolved.get("FOO")?.value).toBe("foo");
    expect(resolved.get("BAR")?.value).toBe("bar");
    expect(missing).toHaveLength(0);
    expect(overridden).toHaveLength(0);
    expect(fromFallback).toHaveLength(0);
  });

  it("applies overrides on top of base", () => {
    const base = makeMap({ FOO: "original", BAR: "bar" });
    const overrides = makeMap({ FOO: "overridden" });
    const { resolved, overridden: ov } = resolveEnvMap(base, { overrides });
    expect(resolved.get("FOO")?.value).toBe("overridden");
    expect(resolved.get("BAR")?.value).toBe("bar");
    expect(ov).toContain("FOO");
  });

  it("fills missing keys from fallbacks", () => {
    const base = makeMap({ FOO: "foo" });
    const fallbacks = makeMap({ BAR: "fallback_bar", FOO: "should_not_use" });
    const { resolved, fromFallback } = resolveEnvMap(base, { fallbacks });
    expect(resolved.get("BAR")?.value).toBe("fallback_bar");
    expect(resolved.get("FOO")?.value).toBe("foo");
    expect(fromFallback).toContain("BAR");
    expect(fromFallback).not.toContain("FOO");
  });

  it("reports missing empty values in strict mode", () => {
    const base = makeMap({ FOO: "", BAR: "bar" });
    const fallbacks = makeMap({ FOO: "filled" });
    const { resolved, missing, fromFallback } = resolveEnvMap(base, { fallbacks, strict: true });
    expect(resolved.get("FOO")?.value).toBe("filled");
    expect(fromFallback).toContain("FOO");
    expect(missing).not.toContain("FOO");
  });

  it("collects still-empty keys as missing in strict mode", () => {
    const base = makeMap({ FOO: "", BAR: "bar" });
    const { missing } = resolveEnvMap(base, { strict: true });
    expect(missing).toContain("FOO");
    expect(missing).not.toContain("BAR");
  });
});

describe("formatResolveReport", () => {
  it("formats a resolve report with overrides and fallbacks", () => {
    const base = makeMap({ FOO: "foo" });
    const overrides = makeMap({ FOO: "new" });
    const fallbacks = makeMap({ BAR: "bar" });
    const result = resolveEnvMap(base, { overrides, fallbacks });
    const report = formatResolveReport(result);
    expect(report).toContain("[Resolve Report]");
    expect(report).toContain("FOO");
    expect(report).toContain("BAR");
  });

  it("shows none when no overrides or fallbacks", () => {
    const base = makeMap({ FOO: "foo" });
    const result = resolveEnvMap(base);
    const report = formatResolveReport(result);
    expect(report).toContain("none");
  });
});
