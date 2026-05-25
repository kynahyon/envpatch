import { EnvMap } from "../parser/types";

export interface UppercaseResult {
  result: EnvMap;
  uppercased: string[];
  skipped: string[];
}

/**
 * Uppercases all keys in the env map.
 * Keys already uppercase are tracked as skipped.
 * Duplicate keys after uppercasing use the last-seen value.
 */
export function uppercaseEnvKeys(map: EnvMap): UppercaseResult {
  const result: EnvMap = new Map();
  const uppercased: string[] = [];
  const skipped: string[] = [];

  for (const [key, entry] of map.entries()) {
    const upper = key.toUpperCase();
    if (upper === key) {
      skipped.push(key);
    } else {
      uppercased.push(key);
    }
    result.set(upper, { ...entry, key: upper });
  }

  return { result, uppercased, skipped };
}

export function formatUppercaseReport(report: UppercaseResult): string {
  const lines: string[] = ["Uppercase Keys Report", "===================="];

  if (report.uppercased.length === 0 && report.skipped.length === 0) {
    lines.push("No keys found.");
    return lines.join("\n");
  }

  if (report.uppercased.length > 0) {
    lines.push(`Uppercased (${report.uppercased.length}):`);
    for (const key of report.uppercased) {
      lines.push(`  ${key} -> ${key.toUpperCase()}`);
    }
  }

  if (report.skipped.length > 0) {
    lines.push(`Already uppercase (${report.skipped.length}):`);
    for (const key of report.skipped) {
      lines.push(`  ${key}`);
    }
  }

  return lines.join("\n");
}
