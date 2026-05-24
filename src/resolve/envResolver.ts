import { EnvMap } from "../parser/types";

export interface ResolveOptions {
  overrides?: EnvMap;
  fallbacks?: EnvMap;
  strict?: boolean;
}

export interface ResolveResult {
  resolved: EnvMap;
  missing: string[];
  overridden: string[];
  fromFallback: string[];
}

/**
 * Resolves a final EnvMap by layering base, overrides, and fallbacks.
 * - overrides take precedence over base
 * - fallbacks fill in missing keys
 * - strict mode collects keys present in base but with empty values
 */
export function resolveEnvMap(
  base: EnvMap,
  options: ResolveOptions = {}
): ResolveResult {
  const { overrides = new Map(), fallbacks = new Map(), strict = false } = options;

  const resolved: EnvMap = new Map();
  const missing: string[] = [];
  const overridden: string[] = [];
  const fromFallback: string[] = [];

  // Apply base
  for (const [key, entry] of base) {
    resolved.set(key, { ...entry });
  }

  // Apply overrides
  for (const [key, entry] of overrides) {
    if (resolved.has(key)) {
      overridden.push(key);
    }
    resolved.set(key, { ...entry });
  }

  // Apply fallbacks for missing or empty keys
  for (const [key, entry] of fallbacks) {
    if (!resolved.has(key) || (strict && resolved.get(key)!.value === "")) {
      resolved.set(key, { ...entry });
      fromFallback.push(key);
    }
  }

  // Collect missing (empty values in strict mode)
  if (strict) {
    for (const [key, entry] of resolved) {
      if (entry.value === "") {
        missing.push(key);
      }
    }
  }

  return { resolved, missing, overridden, fromFallback };
}

export function formatResolveReport(result: ResolveResult): string {
  const lines: string[] = ["[Resolve Report]"];
  lines.push(`  Resolved keys : ${result.resolved.size}`);
  lines.push(`  Overridden     : ${result.overridden.length > 0 ? result.overridden.join(", ") : "none"}`);
  lines.push(`  From fallback  : ${result.fromFallback.length > 0 ? result.fromFallback.join(", ") : "none"}`);
  if (result.missing.length > 0) {
    lines.push(`  Missing/empty  : ${result.missing.join(", ")}`);
  }
  return lines.join("\n");
}
