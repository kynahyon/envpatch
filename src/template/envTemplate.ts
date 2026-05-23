import { EnvMap } from '../parser/types';
import { TemplateField, EnvTemplate, TemplateValidationResult } from './types';

/**
 * Creates a template from an existing EnvMap, marking all keys as required by default.
 */
export function createTemplate(envMap: EnvMap, overrides: Partial<Record<string, Partial<TemplateField>>> = {}): EnvTemplate {
  const fields: Record<string, TemplateField> = {};

  for (const [key, entry] of envMap.entries()) {
    fields[key] = {
      required: true,
      defaultValue: undefined,
      description: '',
      example: entry.value,
      ...overrides[key],
    };
  }

  return { fields, createdAt: new Date().toISOString() };
}

/**
 * Validates an EnvMap against a template, checking required fields and defaults.
 */
export function validateAgainstTemplate(envMap: EnvMap, template: EnvTemplate): TemplateValidationResult {
  const missing: string[] = [];
  const defaultsApplied: Record<string, string> = {};
  const resolved: EnvMap = new Map(envMap);

  for (const [key, field] of Object.entries(template.fields)) {
    if (!resolved.has(key)) {
      if (field.required && field.defaultValue === undefined) {
        missing.push(key);
      } else if (field.defaultValue !== undefined) {
        resolved.set(key, { value: field.defaultValue, comment: `default from template` });
        defaultsApplied[key] = field.defaultValue;
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    defaultsApplied,
    resolved,
  };
}

/**
 * Formats a human-readable report of the template validation result.
 */
export function formatTemplateReport(result: TemplateValidationResult): string {
  const lines: string[] = ['=== Template Validation Report ==='];

  if (result.valid) {
    lines.push('Status: PASSED');
  } else {
    lines.push('Status: FAILED');
    lines.push(`Missing required keys (${result.missing.length}):`);
    result.missing.forEach(k => lines.push(`  - ${k}`));
  }

  const appliedKeys = Object.keys(result.defaultsApplied);
  if (appliedKeys.length > 0) {
    lines.push(`Defaults applied (${appliedKeys.length}):`);
    appliedKeys.forEach(k => lines.push(`  - ${k} = ${result.defaultsApplied[k]}`));
  }

  return lines.join('\n');
}
