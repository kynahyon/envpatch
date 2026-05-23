import { EnvMap } from '../parser/types';
import { LintOptions, LintResult, LintRule, LintViolation } from './types';

const RULES: Record<string, LintRule> = {
  NO_EMPTY_VALUE: {
    id: 'no-empty-value',
    description: 'Environment variable values should not be empty',
    severity: 'warn',
  },
  UPPERCASE_KEY: {
    id: 'uppercase-key',
    description: 'Environment variable keys should be uppercase',
    severity: 'warn',
  },
  NO_LEADING_UNDERSCORE: {
    id: 'no-leading-underscore',
    description: 'Keys should not start with an underscore',
    severity: 'info',
  },
  MAX_KEY_LENGTH: {
    id: 'max-key-length',
    description: 'Key exceeds maximum allowed length',
    severity: 'error',
  },
  MAX_VALUE_LENGTH: {
    id: 'max-value-length',
    description: 'Value exceeds maximum allowed length',
    severity: 'error',
  },
};

export function lintEnvMap(map: EnvMap, options: LintOptions = {}): LintResult {
  const {
    allowEmptyValues = false,
    requireUppercaseKeys = true,
    forbidLeadingUnderscore = false,
    maxKeyLength = 64,
    maxValueLength = 512,
  } = options;

  const violations: LintViolation[] = [];

  for (const [key, entry] of map.entries()) {
    const value = entry.value ?? '';

    if (!allowEmptyValues && value.trim() === '') {
      violations.push({ rule: RULES.NO_EMPTY_VALUE, key, message: `Key "${key}" has an empty value` });
    }

    if (requireUppercaseKeys && key !== key.toUpperCase()) {
      violations.push({ rule: RULES.UPPERCASE_KEY, key, message: `Key "${key}" is not uppercase` });
    }

    if (forbidLeadingUnderscore && key.startsWith('_')) {
      violations.push({ rule: RULES.NO_LEADING_UNDERSCORE, key, message: `Key "${key}" starts with an underscore` });
    }

    if (key.length > maxKeyLength) {
      violations.push({ rule: RULES.MAX_KEY_LENGTH, key, message: `Key "${key}" exceeds max length of ${maxKeyLength}` });
    }

    if (value.length > maxValueLength) {
      violations.push({ rule: RULES.MAX_VALUE_LENGTH, key, message: `Key "${key}" value exceeds max length of ${maxValueLength}` });
    }
  }

  const errorCount = violations.filter(v => v.rule.severity === 'error').length;
  const warnCount = violations.filter(v => v.rule.severity === 'warn').length;
  const infoCount = violations.filter(v => v.rule.severity === 'info').length;

  return { violations, errorCount, warnCount, infoCount, passed: errorCount === 0 };
}

export function formatLintReport(result: LintResult): string {
  if (result.violations.length === 0) {
    return 'Lint passed: no violations found.';
  }
  const lines: string[] = [`Lint report: ${result.errorCount} error(s), ${result.warnCount} warning(s), ${result.infoCount} info(s)\n`];
  for (const v of result.violations) {
    lines.push(`  [${v.rule.severity.toUpperCase()}] ${v.rule.id} — ${v.message}`);
  }
  return lines.join('\n');
}
