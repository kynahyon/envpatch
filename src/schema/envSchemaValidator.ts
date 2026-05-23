import { EnvMap } from '../parser/types';
import {
  EnvSchema,
  FieldSchema,
  SchemaValidationError,
  SchemaValidationResult,
} from './types';

const TYPE_PATTERNS: Record<string, RegExp> = {
  number: /^-?\d+(\.\d+)?$/,
  boolean: /^(true|false|1|0)$/i,
  url: /^https?:\/\/.+/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

function validateField(
  key: string,
  value: string,
  schema: FieldSchema
): SchemaValidationError | null {
  const pattern = schema.pattern ?? TYPE_PATTERNS[schema.type];
  if (pattern && !pattern.test(value)) {
    return { key, message: `Expected type '${schema.type}', got value: "${value}"` };
  }
  return null;
}

export function validateEnvSchema(
  envMap: EnvMap,
  schema: EnvSchema
): SchemaValidationResult {
  const errors: SchemaValidationError[] = [];
  const missing: string[] = [];
  const extra: string[] = [];

  for (const [key, fieldSchema] of Object.entries(schema.fields)) {
    const entry = envMap.get(key);
    if (!entry || entry.value === '') {
      if (fieldSchema.required !== false && fieldSchema.default === undefined) {
        missing.push(key);
      }
      continue;
    }
    const error = validateField(key, entry.value, fieldSchema);
    if (error) errors.push(error);
  }

  for (const key of envMap.keys()) {
    if (!schema.fields[key]) {
      extra.push(key);
    }
  }

  return { valid: errors.length === 0 && missing.length === 0, errors, missing, extra };
}

export function formatSchemaReport(result: SchemaValidationResult): string {
  const lines: string[] = [];
  if (result.valid) {
    lines.push('Schema validation passed.');
  } else {
    lines.push('Schema validation failed.');
  }
  for (const err of result.errors) {
    lines.push(`  [TYPE ERROR] ${err.key}: ${err.message}`);
  }
  for (const key of result.missing) {
    lines.push(`  [MISSING] ${key}: required field not present`);
  }
  if (result.extra.length > 0) {
    lines.push(`  [EXTRA] keys not in schema: ${result.extra.join(', ')}`);
  }
  return lines.join('\n');
}
