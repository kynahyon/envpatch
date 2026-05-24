import { EnvMap } from "../parser/types";
import { FlattenOptions, FlattenResult } from "./types";

/**
 * Flattens an EnvMap by splitting keys on a given separator and rebuilding
 * them with a canonical separator. Useful for normalising keys that originate
 * from JSON / YAML structures where nesting is expressed as e.g. DB__HOST or
 * DB.HOST before ingestion.
 */
export function flattenEnvMap(
  envMap: EnvMap,
  options: FlattenOptions = {}
): FlattenResult {
  const { separator = "__", prefix = "", uppercase = false } = options;

  // Detect any alternative separators present in the keys so we can normalise
  // them all to the canonical separator.
  const altSeparators = [".", "-", ":"];

  const flatMap: Map<string, string> = new Map();
  const renamedKeys: Array<{ original: string; flattened: string }> = [];

  for (const [key, entry] of envMap.entries()) {
    let normalised = key;

    // Replace alternative separators with the canonical one
    for (const alt of altSeparators) {
      if (alt !== separator) {
        normalised = normalised.split(alt).join(separator);
      }
    }

    // Collapse consecutive separators
    const escapedSep = separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    normalised = normalised.replace(
      new RegExp(`${escapedSep}{2,}`, "g"),
      separator
    );

    if (prefix) {
      normalised = `${prefix}${separator}${normalised}`;
    }

    if (uppercase) {
      normalised = normalised.toUpperCase();
    }

    if (normalised !== key) {
      renamedKeys.push({ original: key, flattened: normalised });
    }

    flatMap.set(normalised, entry.value);
  }

  return {
    flatMap,
    originalCount: envMap.size,
    flattenedCount: flatMap.size,
    renamedKeys,
  };
}

export function formatFlattenReport(result: FlattenResult): string {
  const lines: string[] = [
    "=== Flatten Report ===",
    `Original keys : ${result.originalCount}`,
    `Flattened keys: ${result.flattenedCount}`,
  ];

  if (result.renamedKeys.length === 0) {
    lines.push("No keys were renamed.");
  } else {
    lines.push(`Renamed (${result.renamedKeys.length}):`);
    for (const { original, flattened } of result.renamedKeys) {
      lines.push(`  ${original} → ${flattened}`);
    }
  }

  return lines.join("\n");
}
