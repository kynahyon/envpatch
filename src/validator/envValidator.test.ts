import { validateEnvMap, formatValidationReport } from './envValidator';
import { EnvMap } from '../parser/types';
import { ValidationRule } from './types';

function makeMap(entries: Record<string, string>): EnvMap {
  return new Map(Object.entries(entries));
}

describe('validateEnvMap', () => {
  it('returns valid with no errors when all rules pass', () => {
    const map = makeMap({ NODE_ENV: 'production', PORT: '8080' });
    const rules: ValidationRule[] = [
      { key: 'NODE_ENV', required: true, allowedValues: ['development', 'production', 'test'] },
      { key: 'PORT', required: true, pattern: /^\d+$/ },
    ];
    const result = validateEnvMap(map, rules);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports error for missing required key', () => {
    const map = makeMap({ PORT: '3000' });
    const rules: ValidationRule[] = [{ key: 'DATABASE_URL', required: true }];
    const result = validateEnvMap(map, rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0].key).toBe('DATABASE_URL');
    expect(result.errors[0].severity).toBe('error');
  });

  it('reports error for value not in allowedValues', () => {
    const map = makeMap({ NODE_ENV: 'staging' });
    const rules: ValidationRule[] = [
      { key: 'NODE_ENV', required: true, allowedValues: ['development', 'production', 'test'] },
    ];
    const result = validateEnvMap(map, rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('not in allowed values');
  });

  it('reports warning for value not matching pattern on optional key', () => {
    const map = makeMap({ PORT: 'abc' });
    const rules: ValidationRule[] = [{ key: 'PORT', required: false, pattern: /^\d+$/ }];
    const result = validateEnvMap(map, rules);
    expect(result.valid).toBe(true);
    expect(result.errors[0].severity).toBe('warning');
  });

  it('reports warning for value shorter than minLength', () => {
    const map = makeMap({ SECRET_KEY: 'short' });
    const rules: ValidationRule[] = [{ key: 'SECRET_KEY', required: false, minLength: 16 }];
    const result = validateEnvMap(map, rules);
    expect(result.valid).toBe(true);
    expect(result.errors[0].message).toContain('too short');
  });

  it('skips optional missing keys without error', () => {
    const map = makeMap({ PORT: '3000' });
    const rules: ValidationRule[] = [{ key: 'OPTIONAL_KEY', required: false, pattern: /^\w+$/ }];
    const result = validateEnvMap(map, rules);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('formatValidationReport', () => {
  it('returns success message when no errors', () => {
    const report = formatValidationReport({ valid: true, errors: [] });
    expect(report).toBe('Validation passed with no issues.');
  });

  it('includes error lines in report', () => {
    const report = formatValidationReport({
      valid: false,
      errors: [{ key: 'DB_URL', message: 'Required key "DB_URL" is missing.', severity: 'error' }],
    });
    expect(report).toContain('[ERROR]');
    expect(report).toContain('DB_URL');
  });
});
