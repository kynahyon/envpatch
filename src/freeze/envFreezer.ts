import { EnvMap } from '../parser/types';
import { FreezeOptions, FreezeResult, FreezeViolation } from './types';

/**
 * Determines whether a key should be frozen based on options.
 */
export function isFrozenKey(key: string, options: FreezeOptions): boolean {
  const { keys = [], prefixes = [] } = options;
  if (keys.includes(key)) return true;
  return prefixes.some((prefix) => key.startsWith(prefix));
}

/**
 * Freezes a set of keys in the base map, detecting violations when a
 * candidate map attempts to change their values.
 */
export function freezeEnvMap(
  base: EnvMap,
  candidate: EnvMap,
  options: FreezeOptions = {}
): FreezeResult {
  const frozen: Map<string, string> = new Map();
  const skipped: string[] = [];
  const violations: FreezeViolation[] = [];

  for (const [key, entry] of base) {
    if (isFrozenKey(key, options)) {
      frozen.set(key, entry.value);

      if (candidate.has(key)) {
        const candidateValue = candidate.get(key)!.value;
        if (candidateValue !== entry.value) {
          violations.push({
            key,
            originalValue: entry.value,
            attemptedValue: candidateValue,
          });
        }
      }
    } else {
      skipped.push(key);
    }
  }

  return { frozen, skipped, violations };
}

/**
 * Formats a human-readable freeze report.
 */
export function formatFreezeReport(result: FreezeResult): string {
  const lines: string[] = [];

  lines.push(`Frozen keys : ${result.frozen.size}`);
  lines.push(`Skipped keys: ${result.skipped.length}`);
  lines.push(`Violations  : ${result.violations.length}`);

  if (result.violations.length > 0) {
    lines.push('');
    lines.push('Violations:');
    for (const v of result.violations) {
      lines.push(`  [${v.key}] "${v.originalValue}" -> "${v.attemptedValue}" (blocked)`);
    }
  }

  return lines.join('\n');
}
