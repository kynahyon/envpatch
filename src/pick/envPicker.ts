import { EnvMap } from "../parser/types";

export interface PickOptions {
  keys: string[];
  strict?: boolean; // if true, error on missing keys
}

export interface PickResult {
  picked: EnvMap;
  missing: string[];
  found: string[];
}

export function pickEnvKeys(env: EnvMap, options: PickOptions): PickResult {
  const { keys, strict = false } = options;
  const picked: EnvMap = new Map();
  const missing: string[] = [];
  const found: string[] = [];

  for (const key of keys) {
    if (env.has(key)) {
      picked.set(key, env.get(key)!);
      found.push(key);
    } else {
      missing.push(key);
      if (strict) {
        throw new Error(`[envpatch] pickEnvKeys: required key "${key}" not found in env map`);
      }
    }
  }

  return { picked, missing, found };
}

export function formatPickReport(result: PickResult): string {
  const lines: string[] = ["[Pick Report]"];

  if (result.found.length > 0) {
    lines.push(`  Picked (${result.found.length}):`);
    for (const key of result.found) {
      lines.push(`    + ${key}`);
    }
  }

  if (result.missing.length > 0) {
    lines.push(`  Missing (${result.missing.length}):`);
    for (const key of result.missing) {
      lines.push(`    - ${key}`);
    }
  }

  lines.push(`  Total picked: ${result.found.length}`);
  return lines.join("\n");
}
