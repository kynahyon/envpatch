import { ScopeOptions, ScopedEnvResult } from "./types";

/**
 * Scopes an env map to a specific set of keys.
 * In "include" mode, only the listed keys are retained.
 * In "exclude" mode, the listed keys are removed.
 */
export function scopeEnvMap(
  envMap: Map<string, string>,
  options: ScopeOptions
): ScopedEnvResult {
  const { keys, mode } = options;
  const keySet = new Set(keys);
  const scoped = new Map<string, string>();
  const excluded = new Map<string, string>();

  for (const [k, v] of envMap.entries()) {
    const inSet = keySet.has(k);
    const keep = mode === "include" ? inSet : !inSet;
    if (keep) {
      scoped.set(k, v);
    } else {
      excluded.set(k, v);
    }
  }

  return {
    scoped,
    excluded,
    includedKeys: [...scoped.keys()],
    excludedKeys: [...excluded.keys()],
    mode,
  };
}

export function formatScopeReport(result: ScopedEnvResult): string {
  const lines: string[] = [];
  lines.push(`Scope mode: ${result.mode}`);
  lines.push(
    `Scoped keys (${result.includedKeys.length}): ${
      result.includedKeys.length > 0
        ? result.includedKeys.join(", ")
        : "(none)"
    }`
  );
  lines.push(
    `Excluded keys (${result.excludedKeys.length}): ${
      result.excludedKeys.length > 0
        ? result.excludedKeys.join(", ")
        : "(none)"
    }`
  );
  return lines.join("\n");
}
