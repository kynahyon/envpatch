import { EnvMap } from "../parser/types";

export interface PinOptions {
  keys: string[];
  overwrite?: boolean;
}

export interface PinResult {
  pinned: Record<string, string>;
  skipped: string[];
  missing: string[];
}

/**
 * Pins specific keys in an EnvMap to their current values,
 * preventing them from being overwritten during merges.
 */
export function pinEnvMap(
  base: EnvMap,
  pinned: EnvMap,
  options: PinOptions
): { result: EnvMap; report: PinResult } {
  const result: EnvMap = new Map(base);
  const pinnedKeys: Record<string, string> = {};
  const skipped: string[] = [];
  const missing: string[] = [];

  for (const key of options.keys) {
    if (!pinned.has(key)) {
      missing.push(key);
      continue;
    }

    const pinnedValue = pinned.get(key)!;

    if (result.has(key) && !options.overwrite) {
      skipped.push(key);
      continue;
    }

    result.set(key, pinnedValue);
    pinnedKeys[key] = pinnedValue;
  }

  return {
    result,
    report: { pinned: pinnedKeys, skipped, missing },
  };
}

export function formatPinReport(report: PinResult): string {
  const lines: string[] = ["[Pin Report]"];

  const pinnedEntries = Object.entries(report.pinned);
  if (pinnedEntries.length > 0) {
    lines.push("Pinned:");
    for (const [key, value] of pinnedEntries) {
      lines.push(`  ${key}=${value}`);
    }
  }

  if (report.skipped.length > 0) {
    lines.push(`Skipped (already set): ${report.skipped.join(", ")}`);
  }

  if (report.missing.length > 0) {
    lines.push(`Missing in pin source: ${report.missing.join(", ")}`);
  }

  return lines.join("\n");
}
