import { sanitizeEnvMap, formatSanitizeReport } from './envSanitizer';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('sanitizeEnvMap', () => {
  it('trims whitespace from values by default', () => {
    const env = makeMap({ FOO: '  hello  ', BAR: 'clean' });
    const { sanitized, changes } = sanitizeEnvMap(env);
    expect(sanitized.get('FOO')).toBe('hello');
    expect(sanitized.get('BAR')).toBe('clean');
    expect(changes).toHaveLength(1);
    expect(changes[0].key).toBe('FOO');
    expect(changes[0].rules).toContain('trimValues');
  });

  it('strips surrounding quotes when stripQuotes is enabled', () => {
    const env = makeMap({ TOKEN: '"my-secret"', NAME: "'alice'" });
    const { sanitized, changes } = sanitizeEnvMap(env, { stripQuotes: true });
    expect(sanitized.get('TOKEN')).toBe('my-secret');
    expect(sanitized.get('NAME')).toBe('alice');
    expect(changes).toHaveLength(2);
  });

  it('removes non-printable characters', () => {
    const env = makeMap({ VAL: 'hello\x00world' });
    const { sanitized, changes } = sanitizeEnvMap(env, { removeNonPrintable: true });
    expect(sanitized.get('VAL')).toBe('helloworld');
    expect(changes[0].rules).toContain('removeNonPrintable');
  });

  it('collapses internal whitespace', () => {
    const env = makeMap({ MSG: 'hello   world' });
    const { sanitized } = sanitizeEnvMap(env, { collapseWhitespace: true });
    expect(sanitized.get('MSG')).toBe('hello world');
  });

  it('returns no changes when values are already clean', () => {
    const env = makeMap({ A: 'clean', B: 'also-clean' });
    const { changes } = sanitizeEnvMap(env, { trimValues: true });
    expect(changes).toHaveLength(0);
  });

  it('applies multiple rules and records all applied rule names', () => {
    const env = makeMap({ KEY: '  "  spaced  "  ' });
    const { sanitized, changes } = sanitizeEnvMap(env, {
      trimValues: true,
      stripQuotes: true,
    });
    expect(sanitized.get('KEY')).toBe('  spaced  ');
    expect(changes[0].rules).toContain('trimValues');
    expect(changes[0].rules).toContain('stripQuotes');
  });
});

describe('formatSanitizeReport', () => {
  it('reports no changes when result is clean', () => {
    const env = makeMap({ A: 'ok' });
    const result = sanitizeEnvMap(env, { trimValues: true });
    expect(formatSanitizeReport(result)).toMatch(/no changes/);
  });

  it('lists modified keys with before/after values', () => {
    const env = makeMap({ FOO: '  bar  ' });
    const result = sanitizeEnvMap(env, { trimValues: true });
    const report = formatSanitizeReport(result);
    expect(report).toMatch('FOO');
    expect(report).toMatch('trimValues');
  });
});
