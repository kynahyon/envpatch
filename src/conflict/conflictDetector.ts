import { EnvMap } from '../parser/types';

export type ConflictSeverity = 'error' | 'warning';

export interface ConflictEntry {
  key: string;
  baseValue: string;
  patchValue: string;
  severity: ConflictSeverity;
}

export interface ConflictReport {
  conflicts: ConflictEntry[];
  hasErrors: boolean;
  hasWarnings: boolean;
}

/**
 * Detects conflicts between a base EnvMap and a patch EnvMap.
 * A conflict occurs when the same key exists in both maps with different values.
 * Keys present only in the patch are not considered conflicts.
 */
export function detectConflicts(
  base: EnvMap,
  patch: EnvMap,
  errorKeys: Set<string> = new Set()
): ConflictReport {
  const conflicts: ConflictEntry[] = [];

  for (const [key, patchValue] of patch.entries()) {
    const baseValue = base.get(key);
    if (baseValue !== undefined && baseValue !== patchValue) {
      const severity: ConflictSeverity = errorKeys.has(key) ? 'error' : 'warning';
      conflicts.push({ key, baseValue, patchValue, severity });
    }
  }

  return {
    conflicts,
    hasErrors: conflicts.some((c) => c.severity === 'error'),
    hasWarnings: conflicts.some((c) => c.severity === 'warning'),
  };
}

/**
 * Formats a ConflictReport into a human-readable string.
 */
export function formatConflictReport(report: ConflictReport): string {
  if (report.conflicts.length === 0) {
    return 'No conflicts detected.';
  }

  const lines: string[] = [`Found ${report.conflicts.length} conflict(s):\n`];
  for (const conflict of report.conflicts) {
    const tag = conflict.severity === 'error' ? '[ERROR]' : '[WARN] ';
    lines.push(
      `  ${tag} ${conflict.key}\n` +
        `           base:  ${conflict.baseValue}\n` +
        `           patch: ${conflict.patchValue}`
    );
  }
  return lines.join('\n');
}
