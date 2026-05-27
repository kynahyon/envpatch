import { EnvMap, EnvEntry } from '../parser/types';

export interface LowercaseReport {
  totalKeys: number;
  renamedKeys: string[];
  skippedKeys: string[];
}

/**
 * Lowercases all keys in the env map.
 * Keys already lowercase are skipped (no-op).
 * Collision: if lowercasing key A produces a key that already exists, skip A.
 */
export function lowercaseEnvKeys(
  envMap: EnvMap,
  options: { overwriteOnCollision?: boolean } = {}
): { result: EnvMap; report: LowercaseReport } {
  const { overwriteOnCollision = false } = options;
  const result: EnvMap = new Map();
  const renamedKeys: string[] = [];
  const skippedKeys: string[] = [];

  // First pass: collect all lowercased keys to detect collisions
  const lowercasedTargets = new Map<string, string[]>();
  for (const [key] of envMap) {
    const lower = key.toLowerCase();
    if (!lowercasedTargets.has(lower)) {
      lowercasedTargets.set(lower, []);
    }
    lowercasedTargets.get(lower)!.push(key);
  }

  for (const [key, entry] of envMap) {
    const lower = key.toLowerCase();
    const isAlreadyLower = key === lower;
    const hasCollision = (lowercasedTargets.get(lower)?.length ?? 0) > 1;

    if (hasCollision && !overwriteOnCollision) {
      // Keep original key unchanged to avoid silent data loss
      result.set(key, entry);
      skippedKeys.push(key);
      continue;
    }

    if (!isAlreadyLower) {
      renamedKeys.push(key);
    }

    result.set(lower, { ...entry, key: lower });
  }

  return {
    result,
    report: {
      totalKeys: envMap.size,
      renamedKeys,
      skippedKeys,
    },
  };
}

export function formatLowercaseReport(report: LowercaseReport): string {
  const lines: string[] = [
    `Lowercase Report`,
    `  Total keys   : ${report.totalKeys}`,
    `  Renamed      : ${report.renamedKeys.length}`,
    `  Skipped      : ${report.skippedKeys.length}`,
  ];

  if (report.renamedKeys.length > 0) {
    lines.push(`  Renamed keys : ${report.renamedKeys.join(', ')}`);
  }
  if (report.skippedKeys.length > 0) {
    lines.push(`  Skipped keys : ${report.skippedKeys.join(', ')}`);
  }

  return lines.join('\n');
}
