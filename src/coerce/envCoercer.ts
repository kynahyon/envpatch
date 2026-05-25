import { EnvMap } from '../parser/types';
import { CoerceRule, CoerceResult, CoerceReport, CoerceType } from './types';

function coerceValue(value: string, type: CoerceType): { coerced: string; error?: string } {
  switch (type) {
    case 'string':
      return { coerced: value };

    case 'number': {
      const num = Number(value);
      if (isNaN(num)) {
        return { coerced: value, error: `Cannot coerce "${value}" to number` };
      }
      return { coerced: String(num) };
    }

    case 'boolean': {
      const lower = value.toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(lower)) {
        return { coerced: 'true' };
      }
      if (['false', '0', 'no', 'off'].includes(lower)) {
        return { coerced: 'false' };
      }
      return { coerced: value, error: `Cannot coerce "${value}" to boolean` };
    }

    case 'json': {
      try {
        JSON.parse(value);
        return { coerced: value };
      } catch {
        return { coerced: value, error: `Cannot coerce "${value}" to JSON` };
      }
    }

    default:
      return { coerced: value, error: `Unknown coerce type: ${type}` };
  }
}

export function coerceEnvMap(envMap: EnvMap, rules: CoerceRule[]): { envMap: EnvMap; report: CoerceReport } {
  const result: EnvMap = new Map(envMap);
  const results: CoerceResult[] = [];

  for (const rule of rules) {
    const entry = result.get(rule.key);
    if (!entry) continue;

    const { coerced, error } = coerceValue(entry.value, rule.type);
    const success = !error;

    if (success) {
      result.set(rule.key, { ...entry, value: coerced });
    }

    results.push({
      key: rule.key,
      originalValue: entry.value,
      coercedValue: coerced,
      type: rule.type,
      success,
      ...(error ? { error } : {}),
    });
  }

  const report: CoerceReport = {
    results,
    successCount: results.filter((r) => r.success).length,
    failureCount: results.filter((r) => !r.success).length,
  };

  return { envMap: result, report };
}

export function formatCoerceReport(report: CoerceReport): string {
  const lines: string[] = [`Coerce Report: ${report.successCount} succeeded, ${report.failureCount} failed`];
  for (const r of report.results) {
    const status = r.success ? '✔' : '✘';
    const detail = r.success
      ? `${r.originalValue} → ${r.coercedValue} (${r.type})`
      : `${r.originalValue} — ${r.error}`;
    lines.push(`  ${status} ${r.key}: ${detail}`);
  }
  return lines.join('\n');
}
