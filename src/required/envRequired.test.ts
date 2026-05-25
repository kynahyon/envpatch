import { checkRequiredKeys, formatRequiredReport } from './envRequired';
import { EnvMap } from '../parser/types';

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { key, value, comment: undefined, raw: `${key}=${value}` });
  }
  return map;
}

describe('checkRequiredKeys', () => {
  it('passes when all required keys are present', () => {
    const env = makeMap({ DB_HOST: 'localhost', DB_PORT: '5432', APP_ENV: 'production' });
    const result = checkRequiredKeys(env, { keys: ['DB_HOST', 'DB_PORT'] });
    expect(result.passed).toBe(true);
    expect(result.missing).toEqual([]);
    expect(result.present).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('fails when a required key is absent', () => {
    const env = makeMap({ DB_HOST: 'localhost' });
    const result = checkRequiredKeys(env, { keys: ['DB_HOST', 'DB_PASS'] });
    expect(result.passed).toBe(false);
    expect(result.missing).toContain('DB_PASS');
    expect(result.present).toContain('DB_HOST');
  });

  it('treats empty string as missing when strictEmpty is true', () => {
    const env = makeMap({ API_KEY: '' });
    const result = checkRequiredKeys(env, { keys: ['API_KEY'], strictEmpty: true });
    expect(result.passed).toBe(false);
    expect(result.missing).toContain('API_KEY');
  });

  it('accepts empty string when strictEmpty is false', () => {
    const env = makeMap({ API_KEY: '' });
    const result = checkRequiredKeys(env, { keys: ['API_KEY'], strictEmpty: false });
    expect(result.passed).toBe(true);
    expect(result.present).toContain('API_KEY');
  });

  it('returns correct results array', () => {
    const env = makeMap({ FOO: 'bar' });
    const result = checkRequiredKeys(env, { keys: ['FOO', 'BAZ'] });
    expect(result.results).toHaveLength(2);
    expect(result.results[0]).toMatchObject({ key: 'FOO', present: true, value: 'bar' });
    expect(result.results[1]).toMatchObject({ key: 'BAZ', present: false });
  });

  it('passes with empty required keys list', () => {
    const env = makeMap({ X: '1' });
    const result = checkRequiredKeys(env, { keys: [] });
    expect(result.passed).toBe(true);
  });

  it('treats whitespace-only value as missing when strictEmpty is true', () => {
    const env = makeMap({ SECRET: '   ' });
    const result = checkRequiredKeys(env, { keys: ['SECRET'], strictEmpty: true });
    expect(result.passed).toBe(false);
    expect(result.missing).toContain('SECRET');
  });
});

describe('formatRequiredReport', () => {
  it('includes PASSED when all keys present', () => {
    const env = makeMap({ A: '1', B: '2' });
    const result = checkRequiredKeys(env, { keys: ['A', 'B'] });
    const report = formatRequiredReport(result);
    expect(report).toContain('PASSED');
    expect(report).toContain('+ A');
    expect(report).toContain('+ B');
  });

  it('includes FAILED and missing keys', () => {
    const env = makeMap({ A: '1' });
    const result = checkRequiredKeys(env, { keys: ['A', 'MISSING_KEY'] });
    const report = formatRequiredReport(result);
    expect(report).toContain('FAILED');
    expect(report).toContain('- MISSING_KEY');
  });
});
