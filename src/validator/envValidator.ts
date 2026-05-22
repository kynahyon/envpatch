import { EnvMap } from '../parser/types';
import { ValidationResult, ValidationRule, ValidationError } from './types';

/**
 * Validates an EnvMap against a set of rules.
 */
export function validateEnvMap(
  envMap: EnvMap,
  rules: ValidationRule[]
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    const value = envMap.get(rule.key);

    if (rule.required && (value === undefined || value === null)) {
      errors.push({
        key: rule.key,
        message: `Required key "${rule.key}" is missing.`,
        severity: 'error',
      });
      continue;
    }

    if (value === undefined || value === null) {
      continue;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push({
        key: rule.key,
        message: `Value for "${rule.key}" does not match expected pattern ${rule.pattern}.`,
        severity: rule.required ? 'error' : 'warning',
      });
    }

    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      errors.push({
        key: rule.key,
        message: `Value "${value}" for key "${rule.key}" is not in allowed values: [${rule.allowedValues.join(', ')}].`,
        severity: 'error',
      });
    }

    if (rule.minLength !== undefined && value.length < rule.minLength) {
      errors.push({
        key: rule.key,
        message: `Value for "${rule.key}" is too short (min ${rule.minLength} chars).`,
        severity: 'warning',
      });
    }
  }

  return {
    valid: errors.filter((e) => e.severity === 'error').length === 0,
    errors,
  };
}

/**
 * Formats a ValidationResult into a human-readable report string.
 */
export function formatValidationReport(result: ValidationResult): string {
  if (result.valid && result.errors.length === 0) {
    return 'Validation passed with no issues.';
  }

  const lines: string[] = [
    result.valid ? 'Validation passed with warnings:' : 'Validation failed:',
  ];

  for (const error of result.errors) {
    const prefix = error.severity === 'error' ? '[ERROR]' : '[WARN] ';
    lines.push(`  ${prefix} ${error.message}`);
  }

  return lines.join('\n');
}
