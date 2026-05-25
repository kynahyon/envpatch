import { redactEnvMap, formatRedactReport, isRedactedKey, redactValue } from './envRedactor';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('isRedactedKey', () => {
  it('matches exact keys', () => {
    expect(isRedactedKey('MY_KEY', { keys: ['MY_KEY'] })).toBe(true);
    expect(isRedactedKey('OTHER', { keys: ['MY_KEY'] })).toBe(false);
  });

  it('matches default sensitive patterns', () => {
    expect(isRedactedKey('DB_PASSWORD', {})).toBe(true);
    expect(isRedactedKey('API_KEY', {})).toBe(true);
    expect(isRedactedKey('AUTH_TOKEN', {})).toBe(true);
    expect(isRedactedKey('APP_NAME', {})).toBe(false);
  });

  it('matches custom patterns', () => {
    expect(isRedactedKey('INTERNAL_CODE', { patterns: [/internal/i] })).toBe(true);
    expect(isRedactedKey('PUBLIC_URL', { patterns: [/internal/i] })).toBe(false);
  });
});

describe('redactValue', () => {
  it('replaces full value by default', () => {
    expect(redactValue('supersecret', '[REDACTED]')).toBe('[REDACTED]');
  });

  it('reveals partial value when partialReveal is set', () => {
    expect(redactValue('supersecret', '[REDACTED]', 3)).toBe('sup[REDACTED]');
  });

  it('uses full replacement if value shorter than partialReveal', () => {
    expect(redactValue('hi', '[REDACTED]', 5)).toBe('[REDACTED]');
  });
});

describe('redactEnvMap', () => {
  it('redacts sensitive keys with default patterns', () => {
    const env = makeMap({ DB_PASSWORD: 'secret123', APP_NAME: 'myapp', API_KEY: 'key-abc' });
    const result = redactEnvMap(env);
    expect(result.redacted.get('DB_PASSWORD')).toBe('[REDACTED]');
    expect(result.redacted.get('API_KEY')).toBe('[REDACTED]');
    expect(result.redacted.get('APP_NAME')).toBe('myapp');
    expect(result.redactedKeys).toContain('DB_PASSWORD');
    expect(result.redactedKeys).toContain('API_KEY');
  });

  it('uses custom replacement string', () => {
    const env = makeMap({ SECRET_KEY: 'abc' });
    const result = redactEnvMap(env, { replacement: '***' });
    expect(result.redacted.get('SECRET_KEY')).toBe('***');
  });

  it('does not mutate original map', () => {
    const env = makeMap({ PASSWORD: 'pass' });
    const result = redactEnvMap(env);
    expect(result.original.get('PASSWORD')).toBe('pass');
    expect(result.redacted.get('PASSWORD')).toBe('[REDACTED]');
  });
});

describe('formatRedactReport', () => {
  it('formats a report with redacted keys', () => {
    const env = makeMap({ DB_PASSWORD: 'secret', APP_NAME: 'app' });
    const result = redactEnvMap(env);
    const report = formatRedactReport(result);
    expect(report).toContain('Redact Report');
    expect(report).toContain('Redacted     : 1');
    expect(report).toContain('DB_PASSWORD');
  });

  it('shows zero redacted when no sensitive keys', () => {
    const env = makeMap({ APP_NAME: 'app', PORT: '3000' });
    const result = redactEnvMap(env);
    const report = formatRedactReport(result);
    expect(report).toContain('Redacted     : 0');
  });
});
