import { EnvEntry } from '../parser/types';
import { EnvTypeRule, TypeCheckReport, TypeCheckResult } from './types';

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTEGER_REGEX = /^-?\d+$/;
const NUMBER_REGEX = /^-?\d+(\.\d+)?$/;

function checkType(
  value: string,
  expectedType: EnvTypeRule['expectedType']
): { valid: boolean; reason?: string } {
  switch (expectedType) {
    case 'boolean':
      if (value === 'true' || value === 'false') return { valid: true };
      return { valid: false, reason: `Expected 'true' or 'false', got '${value}'` };
    case 'number':
      if (NUMBER_REGEX.test(value)) return { valid: true };
      return { valid: false, reason: `Expected a numeric value, got '${value}'` };
    case 'integer':
      if (INTEGER_REGEX.test(value)) return { valid: true };
      return { valid: false, reason: `Expected an integer value, got '${value}'` };
    case 'url':
      if (URL_REGEX.test(value)) return { valid: true };
      return { valid: false, reason: `Expected a valid URL, got '${value}'` };
    case 'email':
      if (EMAIL_REGEX.test(value)) return { valid: true };
      return { valid: false, reason: `Expected a valid email, got '${value}'` };
    case 'string':
    default:
      return { valid: true };
  }
}

export function typecheckEnvMap(
  envMap: Map<string, EnvEntry>,
  rules: EnvTypeRule[]
): TypeCheckReport {
  const results: TypeCheckResult[] = [];
  let skippedCount = 0;

  for (const rule of rules) {
    const entry = envMap.get(rule.key);

    if (!entry) {
      if (rule.optional) {
        skippedCount++;
        continue;
      }
      results.push({
        key: rule.key,
        value: '',
        expectedType: rule.expectedType,
        valid: false,
        reason: `Key '${rule.key}' is missing and not optional`,
      });
      continue;
    }

    const { valid, reason } = checkType(entry.value, rule.expectedType);
    results.push({ key: rule.key, value: entry.value, expectedType: rule.expectedType, valid, reason });
  }

  const passCount = results.filter((r) => r.valid).length;
  const failCount = results.filter((r) => !r.valid).length;

  return { results, passCount, failCount, skippedCount };
}

export function formatTypecheckReport(report: TypeCheckReport): string {
  const lines: string[] = [`Type Check Report: ${report.passCount} passed, ${report.failCount} failed, ${report.skippedCount} skipped`];
  for (const result of report.results) {
    const status = result.valid ? '✓' : '✗';
    const detail = result.valid ? `[${result.expectedType}]` : `[${result.expectedType}] ${result.reason}`;
    lines.push(`  ${status} ${result.key}: ${detail}`);
  }
  return lines.join('\n');
}
