import { EnvMap } from "../parser/types";

export interface PrefixOptions {
  prefix: string;
  separator?: string;
  overwrite?: boolean;
}

export interface PrefixResult {
  original: EnvMap;
  prefixed: EnvMap;
  added: string[];
  skipped: string[];
}

export function addPrefix(map: EnvMap, options: PrefixOptions): PrefixResult {
  const { prefix, separator = "_", overwrite = false } = options;
  const prefixed: EnvMap = new Map(map);
  const added: string[] = [];
  const skipped: string[] = [];

  for (const [key, entry] of map.entries()) {
    if (key.startsWith(prefix + separator)) {
      skipped.push(key);
      continue;
    }
    const newKey = `${prefix}${separator}${key}`;
    if (prefixed.has(newKey) && !overwrite) {
      skipped.push(key);
      continue;
    }
    prefixed.set(newKey, { ...entry });
    prefixed.delete(key);
    added.push(newKey);
  }

  return { original: map, prefixed, added, skipped };
}

export function removePrefix(map: EnvMap, options: Pick<PrefixOptions, "prefix" | "separator">): EnvMap {
  const { prefix, separator = "_" } = options;
  const result: EnvMap = new Map();
  const fullPrefix = `${prefix}${separator}`;

  for (const [key, entry] of map.entries()) {
    if (key.startsWith(fullPrefix)) {
      const stripped = key.slice(fullPrefix.length);
      result.set(stripped, { ...entry });
    } else {
      result.set(key, { ...entry });
    }
  }

  return result;
}

export function formatPrefixReport(result: PrefixResult, prefix: string): string {
  const lines: string[] = [
    `Prefix Report — prefix: "${prefix}"`,
    `  Added   : ${result.added.length}`,
    `  Skipped : ${result.skipped.length}`,
  ];
  for (const key of result.added) {
    lines.push(`  + ${key}`);
  }
  for (const key of result.skipped) {
    lines.push(`  ~ ${key} (skipped)`);
  }
  return lines.join("\n");
}
