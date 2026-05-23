import { FilterOptions, FilterResult } from "./types";

/**
 * Returns true if the key matches any of the given prefixes.
 */
function matchesPrefix(key: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => key.startsWith(prefix));
}

/**
 * Filters an env map by explicit keys and/or key prefixes.
 * Supports both "include" (allowlist) and "exclude" (denylist) modes.
 */
export function filterEnvMap(
  envMap: Map<string, string>,
  options: FilterOptions = {}
): FilterResult {
  const { keys = [], prefixes = [], mode = "include" } = options;

  const keptKeys: string[] = [];
  const removedKeys: string[] = [];
  const filtered = new Map<string, string>();

  for (const [key, value] of envMap.entries()) {
    const matchedByKey = keys.includes(key);
    const matchedByPrefix = prefixes.length > 0 && matchesPrefix(key, prefixes);
    const matched = matchedByKey || matchedByPrefix;

    const keep = mode === "include" ? matched : !matched;

    if (keep) {
      filtered.set(key, value);
      keptKeys.push(key);
    } else {
      removedKeys.push(key);
    }
  }

  return { filtered, removedKeys, keptKeys };
}

/**
 * Returns a human-readable summary of a filter operation.
 */
export function formatFilterReport(result: FilterResult): string {
  const lines: string[] = [
    `Filter Report`,
    `  Kept:    ${result.keptKeys.length} key(s) — ${result.keptKeys.join(", ") || "(none)"}`,
    `  Removed: ${result.removedKeys.length} key(s) — ${result.removedKeys.join(", ") || "(none)"}`,
  ];
  return lines.join("\n");
}
