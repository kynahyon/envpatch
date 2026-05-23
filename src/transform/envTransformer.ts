import { EnvMap } from '../parser/types';
import { TransformRule, TransformResult, TransformReport } from './types';

export function applyTransformRules(
  envMap: EnvMap,
  rules: TransformRule[]
): { result: EnvMap; report: TransformReport } {
  const result: EnvMap = new Map(envMap);
  const applied: TransformResult[] = [];
  const skipped: string[] = [];

  for (const [key, entry] of envMap.entries()) {
    let matched = false;

    for (const rule of rules) {
      const keyMatches =
        typeof rule.key === 'string'
          ? rule.key === key
          : rule.key.test(key);

      if (keyMatches) {
        const originalValue = entry.value;
        const transformedValue = rule.transform(key, originalValue);
        result.set(key, { ...entry, value: transformedValue });
        applied.push({
          key,
          originalValue,
          transformedValue,
          ruleApplied: rule.description ?? String(rule.key),
        });
        matched = true;
        break;
      }
    }

    if (!matched) {
      skipped.push(key);
    }
  }

  return {
    result,
    report: {
      applied,
      skipped,
      totalKeys: envMap.size,
    },
  };
}

export function formatTransformReport(report: TransformReport): string {
  const lines: string[] = [
    `Transform Report (${report.totalKeys} keys total)`,
    `  Applied: ${report.applied.length}`,
    `  Skipped: ${report.skipped.length}`,
  ];

  if (report.applied.length > 0) {
    lines.push('\nTransformed:');
    for (const r of report.applied) {
      lines.push(`  [${r.ruleApplied}] ${r.key}: "${r.originalValue}" -> "${r.transformedValue}"`);
    }
  }

  if (report.skipped.length > 0) {
    lines.push('\nSkipped:');
    for (const key of report.skipped) {
      lines.push(`  ${key}`);
    }
  }

  return lines.join('\n');
}
