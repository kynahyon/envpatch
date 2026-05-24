import { EnvMap } from '../parser/types';

export interface DefaultsOptions {
  /** If true, existing keys in target will not be overwritten */
  preserveExisting?: boolean;
  /** If true, only apply defaults for keys already present in target */
  onlyKnownKeys?: boolean;
}

export interface DefaultsResult {
  result: EnvMap;
  applied: string[];
  skipped: string[];
}

/**
 * Applies default values from `defaults` into `target`.
 * By default, only fills in missing keys.
 */
export function applyDefaults(
  target: EnvMap,
  defaults: EnvMap,
  options: DefaultsOptions = {}
): DefaultsResult {
  const { preserveExisting = true, onlyKnownKeys = false } = options;
  const result: EnvMap = new Map(target);
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const [key, entry] of defaults) {
    if (onlyKnownKeys && !target.has(key)) {
      skipped.push(key);
      continue;
    }

    if (preserveExisting && target.has(key)) {
      skipped.push(key);
      continue;
    }

    result.set(key, { ...entry });
    applied.push(key);
  }

  return { result, applied, skipped };
}

export function formatDefaultsReport(result: DefaultsResult): string {
  const lines: string[] = ['=== Defaults Report ==='];

  if (result.applied.length > 0) {
    lines.push(`Applied (${result.applied.length}):`);
    for (const key of result.applied) {
      lines.push(`  + ${key}`);
    }
  } else {
    lines.push('Applied (0): none');
  }

  if (result.skipped.length > 0) {
    lines.push(`Skipped (${result.skipped.length}):`);
    for (const key of result.skipped) {
      lines.push(`  - ${key}`);
    }
  } else {
    lines.push('Skipped (0): none');
  }

  return lines.join('\n');
}
