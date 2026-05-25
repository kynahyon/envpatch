import { EnvMap } from "../parser/types";
import { DeprecateOptions, DeprecateResult, DeprecatedKeyEntry } from "./types";

/**
 * Checks an env map for deprecated keys, optionally removing them.
 */
export function deprecateEnvKeys(
  envMap: EnvMap,
  options: DeprecateOptions
): DeprecateResult {
  const result = new Map(envMap);
  const found: DeprecatedKeyEntry[] = [];
  const notFound: string[] = [];

  for (const entry of options.deprecated) {
    if (result.has(entry.key)) {
      found.push(entry);
      if (options.removeDeprecated) {
        result.delete(entry.key);
      }
    } else {
      notFound.push(entry.key);
    }
  }

  return { result, found, notFound };
}

/**
 * Formats a human-readable report of deprecated key findings.
 */
export function formatDeprecateReport(deprecateResult: DeprecateResult): string {
  const lines: string[] = ["=== Deprecation Report ==="];

  if (deprecateResult.found.length === 0) {
    lines.push("No deprecated keys found.");
  } else {
    lines.push(`Deprecated keys found (${deprecateResult.found.length}):`);
    for (const entry of deprecateResult.found) {
      let line = `  - ${entry.key}: ${entry.reason}`;
      if (entry.replacedBy) {
        line += ` (use '${entry.replacedBy}' instead)`;
      }
      lines.push(line);
    }
  }

  if (deprecateResult.notFound.length > 0) {
    lines.push(`Already absent keys (${deprecateResult.notFound.length}): ${deprecateResult.notFound.join(", ")}`);
  }

  return lines.join("\n");
}
