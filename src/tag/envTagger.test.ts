import { tagEnvMap, filterByTags, formatTagReport, buildTagReport } from './envTagger';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('tagEnvMap', () => {
  it('attaches tags to matching keys', () => {
    const entries = makeMap({ DB_HOST: 'localhost', API_KEY: 'secret', PORT: '3000' });
    const rules = [
      { key: 'DB_HOST', tags: ['database', 'infra'] },
      { key: 'API_KEY', tags: ['secret'] },
    ];
    const result = tagEnvMap(entries, rules);
    expect(result.tags.get('DB_HOST')).toEqual(['database', 'infra']);
    expect(result.tags.get('API_KEY')).toEqual(['secret']);
    expect(result.tags.get('PORT')).toEqual([]);
  });

  it('deduplicates tags', () => {
    const entries = makeMap({ KEY: 'val' });
    const rules = [
      { key: 'KEY', tags: ['a', 'b'] },
      { key: 'KEY', tags: ['b', 'c'] },
    ];
    const result = tagEnvMap(entries, rules);
    expect(result.tags.get('KEY')).toEqual(['a', 'b', 'c']);
  });

  it('ignores rules for keys not in entries', () => {
    const entries = makeMap({ EXISTING: '1' });
    const rules = [{ key: 'MISSING', tags: ['x'] }];
    const result = tagEnvMap(entries, rules);
    expect(result.tags.has('MISSING')).toBe(false);
  });
});

describe('filterByTags', () => {
  const entries = makeMap({ A: '1', B: '2', C: '3', D: '4' });
  const tagged = tagEnvMap(entries, [
    { key: 'A', tags: ['alpha', 'shared'] },
    { key: 'B', tags: ['beta', 'shared'] },
    { key: 'C', tags: ['alpha'] },
  ]);

  it('filters by any tag (default)', () => {
    const result = filterByTags(tagged, ['alpha']);
    expect([...result.keys()].sort()).toEqual(['A', 'C']);
  });

  it('filters by all tags (matchAll)', () => {
    const result = filterByTags(tagged, ['alpha', 'shared'], { matchAll: true });
    expect([...result.keys()]).toEqual(['A']);
  });

  it('returns empty map when no keys match', () => {
    const result = filterByTags(tagged, ['nonexistent']);
    expect(result.size).toBe(0);
  });
});

describe('buildTagReport', () => {
  it('counts tagged and untagged keys', () => {
    const entries = makeMap({ X: '1', Y: '2', Z: '3' });
    const tagged = tagEnvMap(entries, [{ key: 'X', tags: ['t1'] }, { key: 'Y', tags: ['t1', 't2'] }]);
    const report = buildTagReport(tagged);
    expect(report.totalKeys).toBe(3);
    expect(report.totalTags).toBe(2);
    expect(report.tagged).toHaveLength(2);
    expect(report.untagged).toEqual(['Z']);
  });
});

describe('formatTagReport', () => {
  it('produces a non-empty string report', () => {
    const entries = makeMap({ FOO: 'bar' });
    const tagged = tagEnvMap(entries, [{ key: 'FOO', tags: ['example'] }]);
    const report = formatTagReport(tagged);
    expect(typeof report).toBe('string');
    expect(report).toContain('FOO');
    expect(report).toContain('example');
  });
});
