import { EnvMap } from '../parser/types';
import { RequiredCheckResult, RequiredKeyResult, RequiredOptions } from './types';

/**
 * Checks whether all required keys are present (and optionally non-empty) in the env map.
 */
export function checkRequiredKeys(
  env: EnvMap,
  options: RequiredOptions
): RequiredCheckResult {
  const { keys, strictEmpty = true } = options;
  const results: RequiredKeyResult[] = [];
  const missing: string[] = [];
  const present: string[] = [];

  for (const key of keys) {
    const entry = env.get(key);
    const value = entry?.value;
    const isMissing =
      entry === undefined || (strictEmpty && (value === undefined || value.trim() === ''));

    results.push({ key, present: !isMissing, value });

    if (isMissing) {
      missing.push(key);
    } else {
      present.push(key);
    }
  }

  return {
    passed: missing.length === 0,
    missing,
    present,
    results,
  };
}

/**
 * Formats a human-readable report of the required-key check.
 */
export function formatRequiredReport(result: RequiredCheckResult): string {
  const lines: string[] = [];
  lines.push(`Required Keys Check: ${result.passed ? 'PASSED' : 'FAILED'}`);
  lines.push(`  Present : ${result.present.length}`);
  lines.push(`  Missing : ${result.missing.length}`);

  if (result.missing.length > 0) {
    lines.push('  Missing keys:');
    for (const key of result.missing) {
      lines.push(`    - ${key}`);
    }
  }

  if (result.present.length > 0) {
    lines.push('  Present keys:');
    for (const key of result.present) {
      lines.push(`    + ${key}`);
    }
  }

  return lines.join('\n');
}
