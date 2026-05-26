import { EnvMap } from '../parser/types';
import { BoundaryRule, BoundaryResult, BoundaryViolation } from './types';

export function checkBoundaries(
  envMap: EnvMap,
  rules: BoundaryRule[]
): BoundaryResult {
  const violations: BoundaryViolation[] = [];

  for (const rule of rules) {
    const entry = envMap.get(rule.key);
    if (!entry) continue;

    const value = entry.value;

    if (rule.minLength !== undefined && value.length < rule.minLength) {
      violations.push({
        key: rule.key,
        value,
        rule: 'minLength',
        detail: `Length ${value.length} is below minimum ${rule.minLength}`,
      });
    }

    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      violations.push({
        key: rule.key,
        value,
        rule: 'maxLength',
        detail: `Length ${value.length} exceeds maximum ${rule.maxLength}`,
      });
    }

    const numeric = Number(value);

    if (rule.minValue !== undefined && !isNaN(numeric) && numeric < rule.minValue) {
      violations.push({
        key: rule.key,
        value,
        rule: 'minValue',
        detail: `Value ${numeric} is below minimum ${rule.minValue}`,
      });
    }

    if (rule.maxValue !== undefined && !isNaN(numeric) && numeric > rule.maxValue) {
      violations.push({
        key: rule.key,
        value,
        rule: 'maxValue',
        detail: `Value ${numeric} exceeds maximum ${rule.maxValue}`,
      });
    }

    if (rule.pattern !== undefined && !rule.pattern.test(value)) {
      violations.push({
        key: rule.key,
        value,
        rule: 'pattern',
        detail: `Value does not match required pattern ${rule.pattern}`,
      });
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    checkedCount: rules.filter((r) => envMap.has(r.key)).length,
    violationCount: violations.length,
  };
}

export function formatBoundaryReport(result: BoundaryResult): string {
  const lines: string[] = [];
  lines.push(`Boundary Check: ${result.valid ? 'PASSED' : 'FAILED'}`);
  lines.push(`  Checked: ${result.checkedCount}, Violations: ${result.violationCount}`);
  if (result.violations.length > 0) {
    lines.push('  Violations:');
    for (const v of result.violations) {
      lines.push(`    [${v.rule}] ${v.key}="${v.value}" — ${v.detail}`);
    }
  }
  return lines.join('\n');
}
