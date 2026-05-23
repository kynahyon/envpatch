import { describe, it, expect } from 'vitest';
import { lintEnvMap, formatLintReport } from './envLinter';
import { EnvMap } from '../parser/types';

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { value, comments: [] });
  }
  return map;
}

describe('lintEnvMap', () => {
  it('passes a clean map with defaults', () => {
    const map = makeMap({ API_KEY: 'abc123', DB_HOST: 'localhost' });
    const result = lintEnvMap(map);
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('warns on empty values by default', () => {
    const map = makeMap({ API_KEY: '' });
    const result = lintEnvMap(map);
    expect(result.warnCount).toBe(1);
    expect(result.violations[0].rule.id).toBe('no-empty-value');
  });

  it('allows empty values when option is set', () => {
    const map = makeMap({ API_KEY: '' });
    const result = lintEnvMap(map, { allowEmptyValues: true });
    expect(result.violations.filter(v => v.rule.id === 'no-empty-value')).toHaveLength(0);
  });

  it('warns on lowercase keys when requireUppercaseKeys is true', () => {
    const map = makeMap({ api_key: 'value' });
    const result = lintEnvMap(map, { allowEmptyValues: true });
    expect(result.violations.some(v => v.rule.id === 'uppercase-key')).toBe(true);
  });

  it('reports error when key exceeds maxKeyLength', () => {
    const longKey = 'A'.repeat(70);
    const map = makeMap({ [longKey]: 'val' });
    const result = lintEnvMap(map, { maxKeyLength: 64 });
    expect(result.errorCount).toBeGreaterThan(0);
    expect(result.passed).toBe(false);
  });

  it('flags leading underscore keys when option is set', () => {
    const map = makeMap({ _PRIVATE: 'secret' });
    const result = lintEnvMap(map, { forbidLeadingUnderscore: true });
    expect(result.violations.some(v => v.rule.id === 'no-leading-underscore')).toBe(true);
  });
});

describe('formatLintReport', () => {
  it('returns pass message when no violations', () => {
    const map = makeMap({ KEY: 'val' });
    const result = lintEnvMap(map);
    expect(formatLintReport(result)).toContain('Lint passed');
  });

  it('includes violation details in report', () => {
    const map = makeMap({ key: '' });
    const result = lintEnvMap(map);
    const report = formatLintReport(result);
    expect(report).toContain('WARN');
    expect(report).toContain('no-empty-value');
  });
});
