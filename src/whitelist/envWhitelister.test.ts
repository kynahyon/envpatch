import { whitelistEnvMap, isAllowedKey, formatWhitelistReport } from "./envWhitelister";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("isAllowedKey", () => {
  it("returns true for an exact match", () => {
    expect(isAllowedKey("DB_HOST", ["DB_HOST", "DB_PORT"])).toBe(true);
  });

  it("returns false when key is not in list", () => {
    expect(isAllowedKey("SECRET", ["DB_HOST", "DB_PORT"])).toBe(false);
  });

  it("is case-sensitive by default", () => {
    expect(isAllowedKey("db_host", ["DB_HOST"])).toBe(false);
  });

  it("supports case-insensitive matching", () => {
    expect(isAllowedKey("db_host", ["DB_HOST"], true)).toBe(true);
  });
});

describe("whitelistEnvMap", () => {
  const env = makeMap({
    DB_HOST: "localhost",
    DB_PORT: "5432",
    SECRET_KEY: "s3cr3t",
    API_URL: "https://api.example.com",
  });

  it("separates allowed and disallowed keys", () => {
    const result = whitelistEnvMap(env, { allowedKeys: ["DB_HOST", "DB_PORT"] });
    expect(result.allowedCount).toBe(2);
    expect(result.disallowedCount).toBe(2);
    expect(result.allowed.has("DB_HOST")).toBe(true);
    expect(result.disallowed.has("SECRET_KEY")).toBe(true);
  });

  it("returns all keys as allowed when all are whitelisted", () => {
    const result = whitelistEnvMap(env, {
      allowedKeys: ["DB_HOST", "DB_PORT", "SECRET_KEY", "API_URL"],
    });
    expect(result.allowedCount).toBe(4);
    expect(result.disallowedCount).toBe(0);
  });

  it("returns all keys as disallowed when none match", () => {
    const result = whitelistEnvMap(env, { allowedKeys: [] });
    expect(result.allowedCount).toBe(0);
    expect(result.disallowedCount).toBe(4);
  });

  it("supports case-insensitive matching", () => {
    const result = whitelistEnvMap(env, {
      allowedKeys: ["db_host"],
      caseInsensitive: true,
    });
    expect(result.allowedCount).toBe(1);
    expect(result.allowed.has("DB_HOST")).toBe(true);
  });

  it("reports correct totalKeys", () => {
    const result = whitelistEnvMap(env, { allowedKeys: ["DB_HOST"] });
    expect(result.totalKeys).toBe(4);
  });
});

describe("formatWhitelistReport", () => {
  it("includes summary counts", () => {
    const env = makeMap({ DB_HOST: "localhost", SECRET: "x" });
    const result = whitelistEnvMap(env, { allowedKeys: ["DB_HOST"] });
    const report = formatWhitelistReport(result);
    expect(report).toContain("Allowed      : 1");
    expect(report).toContain("Disallowed   : 1");
    expect(report).toContain("+ DB_HOST");
    expect(report).toContain("- SECRET");
  });

  it("omits disallowed section when all keys are allowed", () => {
    const env = makeMap({ DB_HOST: "localhost" });
    const result = whitelistEnvMap(env, { allowedKeys: ["DB_HOST"] });
    const report = formatWhitelistReport(result);
    expect(report).not.toContain("Disallowed keys:");
  });
});
