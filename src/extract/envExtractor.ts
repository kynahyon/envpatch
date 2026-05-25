import { EnvMap } from "../parser/types";

export interface ExtractOptions {
  keys: string[];
  strict?: boolean; // if true, throw when a key is missing
}

export interface ExtractResult {
  extracted: EnvMap;
  missing: string[];
  found: string[];
}

export function extractEnvKeys(
  envMap: EnvMap,
  options: ExtractOptions
): ExtractResult {
  const { keys, strict = false } = options;
  const extracted: EnvMap = new Map();
  const missing: string[] = [];
  const found: string[] = [];

  for (const key of keys) {
    if (envMap.has(key)) {
      extracted.set(key, envMap.get(key)!);
      found.push(key);
    } else {
      missing.push(key);
    }
  }

  if (strict && missing.length > 0) {
    throw new Error(
      `extractEnvKeys: missing required keys: ${missing.join(", ")}`
    );
  }

  return { extracted, missing, found };
}

export function formatExtractReport(result: ExtractResult): string {
  const lines: string[] = ["[Extract Report]"];

  lines.push(`  Found    : ${result.found.length}`);
  lines.push(`  Missing  : ${result.missing.length}`);

  if (result.found.length > 0) {
    lines.push("  Extracted keys:");
    for (const key of result.found) {
      lines.push(`    + ${key}`);
    }
  }

  if (result.missing.length > 0) {
    lines.push("  Missing keys:");
    for (const key of result.missing) {
      lines.push(`    - ${key}`);
    }
  }

  return lines.join("\n");
}
