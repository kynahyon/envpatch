import { dedupeEnvMaps, formatDedupeReport } from './envDeduper';
import { EnvMap } from '../parser/types';

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { value, raw: `${key}=${value}`, comment: undefined });
  }
  return map;
}

describe('dedupeEnvMaps', () => {
  it('returns empty map for no inputs', () => {
    const result = dedupeEnvMaps([]);
    expect(result.deduped.size).toBe(0);
    expect(result.duplicates.size).toBe(0);
    expect(result.removedCount).toBe(0);
  });

  it('returns single map unchanged when no duplicates', () => {
    const map = makeMap({ FOO: 'foo', BAR: 'bar' });
    const result = dedupeEnvMaps([map]);
    expect(result.deduped.size).toBe(2);
    expect(result.duplicates.size).toBe(0);
    expect(result.removedCount).toBe(0);
  });

  it('detects duplicates across two maps', () => {
    const a = makeMap({ FOO: 'first', BAR: 'bar' });
    const b = makeMap({ FOO: 'second', BAZ: 'baz' });
    const result = dedupeEnvMaps([a, b]);
    expect(result.duplicates.has('FOO')).toBe(true);
    expect(result.duplicates.get('FOO')).toEqual(['first', 'second']);
    expect(result.removedCount).toBe(1);
  });

  it('last map value wins for duplicate keys', () => {
    const a = makeMap({ FOO: 'alpha' });
    const b = makeMap({ FOO: 'beta' });
    const c = makeMap({ FOO: 'gamma' });
    const result = dedupeEnvMaps([a, b, c]);
    expect(result.deduped.get('FOO')?.value).toBe('gamma');
    expect(result.removedCount).toBe(2);
  });

  it('merges unique keys from all maps', () => {
    const a = makeMap({ A: '1' });
    const b = makeMap({ B: '2' });
    const c = makeMap({ C: '3' });
    const result = dedupeEnvMaps([a, b, c]);
    expect(result.deduped.size).toBe(3);
    expect(result.duplicates.size).toBe(0);
  });
});

describe('formatDedupeReport', () => {
  it('reports no duplicates when clean', () => {
    const map = makeMap({ FOO: 'bar' });
    const result = dedupeEnvMaps([map]);
    const report = formatDedupeReport(result);
    expect(report).toContain('No duplicates found.');
    expect(report).toContain('Removed: 0');
  });

  it('lists duplicate keys in report', () => {
    const a = makeMap({ SECRET: 'old' });
    const b = makeMap({ SECRET: 'new' });
    const result = dedupeEnvMaps([a, b]);
    const report = formatDedupeReport(result);
    expect(report).toContain('SECRET');
    expect(report).toContain('kept last');
    expect(report).toContain('Removed: 1');
  });
});
