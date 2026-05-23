import { filterEnvMap, formatFilterReport } from './envFilter';
import { EnvMap, EnvEntry } from '../parser/types';

function makeMap(obj: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(obj)) {
    const entry: EnvEntry = { key, value, comment: undefined, raw: `${key}=${value}` };
    map.set(key, entry);
  }
  return map;
}

const sampleMap = makeMap({
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'envpatch',
  APP_ENV: 'production',
  SECRET_KEY: 'abc123',
});

describe('filterEnvMap', () => {
  it('filters by prefix', () => {
    const result = filterEnvMap(sampleMap, { prefix: 'DB_' });
    expect(result.matched.size).toBe(2);
    expect(result.matched.has('DB_HOST')).toBe(true);
    expect(result.matched.has('DB_PORT')).toBe(true);
    expect(result.excluded.size).toBe(3);
  });

  it('filters by suffix', () => {
    const result = filterEnvMap(sampleMap, { suffix: '_KEY' });
    expect(result.matched.size).toBe(1);
    expect(result.matched.has('SECRET_KEY')).toBe(true);
  });

  it('filters by explicit keys', () => {
    const result = filterEnvMap(sampleMap, { keys: ['APP_NAME', 'APP_ENV'] });
    expect(result.matched.size).toBe(2);
    expect(result.matched.has('APP_NAME')).toBe(true);
  });

  it('filters by regex pattern', () => {
    const result = filterEnvMap(sampleMap, { pattern: /^APP_/ });
    expect(result.matched.size).toBe(2);
  });

  it('excludes matched keys when exclude=true', () => {
    const result = filterEnvMap(sampleMap, { prefix: 'DB_', exclude: true });
    expect(result.matched.size).toBe(3);
    expect(result.matched.has('APP_NAME')).toBe(true);
    expect(result.excluded.size).toBe(2);
  });

  it('returns all keys when no filter criteria match anything specific', () => {
    const result = filterEnvMap(sampleMap, {});
    expect(result.matched.size).toBe(sampleMap.size);
  });
});

describe('formatFilterReport', () => {
  it('produces a non-empty report string', () => {
    const result = filterEnvMap(sampleMap, { prefix: 'APP_' });
    const report = formatFilterReport(result);
    expect(report).toContain('Filter Report');
    expect(report).toContain('Matched  : 2');
    expect(report).toContain('+ APP_NAME');
  });
});
