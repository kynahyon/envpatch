import { EnvMap } from "../parser/types";
import { WhitelistOptions, WhitelistResult } from "./types";

/**
 * Checks whether a key is in the allowed list, respecting case sensitivity.
 */
export function isAllowedKey(
  key: string,
  allowedKeys: string[],
  caseInsensitive = false
): boolean {
  if (caseInsensitive) {
    const lower = key.toLowerCase();
    return allowedKeys.some((k) => k.toLowerCase() === lower);
  }
  return allowedKeys.includes(key);
}

/**
 * Filters an EnvMap against a whitelist of allowed keys.
 * Returns both allowed and disallowed entries.
 */
export function whitelistEnvMap(
  envMap: EnvMap,
  options: WhitelistOptions
): WhitelistResult {
  const { allowedKeys, caseInsensitive = false } = options;
  const allowed: Map<string, string> = new Map();
  const disallowed: Map<string, string> = new Map();

  for (const [key, value] of envMap.entries()) {
    if (isAllowedKey(key, allowedKeys, caseInsensitive)) {
      allowed.set(key, value);
    } else {
      disallowed.set(key, value);
    }
  }

  return {
    allowed,
    disallowed,
    totalKeys: envMap.size,
    allowedCount: allowed.size,
    disallowedCount: disallowed.size,
  };
}

/**
 * Formats a human-readable report of the whitelist operation.
 */
export function formatWhitelistReport(result: WhitelistResult): string {
  const lines: string[] = [
    `Whitelist Report`,
    `================`,
    `Total keys   : ${result.totalKeys}`,
    `Allowed      : ${result.allowedCount}`,
    `Disallowed   : ${result.disallowedCount}`,
  ];

  if (result.allowedCount > 0) {
    lines.push("", "Allowed keys:");
    for (const key of result.allowed.keys()) {
      lines.push(`  + ${key}`);
    }
  }

  if (result.disallowedCount > 0) {
    lines.push("", "Disallowed keys:");
    for (const key of result.disallowed.keys()) {
      lines.push(`  - ${key}`);
    }
  }

  return lines.join("\n");
}
