import { groupEnvMap, flattenGroupedEnvMap, formatGroupReport } from './envGrouper';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('groupEnvMap', () => {
  it('groups keys by underscore prefix by default', () => {
    const env = makeMap({ DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'test', PORT: '3000' });
    const result = groupEnvMap(env);
    expect(result.groups['DB'].get('DB_HOST')).toBe('localhost');
    expect(result.groups['DB'].get('DB_PORT')).toBe('5432');
    expect(result.groups['APP'].get('APP_NAME')).toBe('test');
    expect(result.ungrouped.get('PORT')).toBe('3000');
  });

  it('respects explicit groups', () => {
    const env = makeMap({ DB_HOST: 'localhost', DB_PORT: '5432', REDIS_HOST: 'redis' });
    const result = groupEnvMap(env, {
      explicitGroups: [{ name: 'database', keys: ['DB_HOST', 'DB_PORT'] }],
    });
    expect(result.groups['database'].get('DB_HOST')).toBe('localhost');
    expect(result.groups['REDIS'].get('REDIS_HOST')).toBe('redis');
  });

  it('excludes ungrouped when includeUngrouped is false', () => {
    const env = makeMap({ DB_HOST: 'localhost', PORT: '3000' });
    const result = groupEnvMap(env, { includeUngrouped: false });
    expect(result.ungrouped.size).toBe(0);
    expect(result.groups['DB'].get('DB_HOST')).toBe('localhost');
  });

  it('uses custom delimiter', () => {
    const env = makeMap({ 'DB.HOST': 'localhost', 'DB.PORT': '5432' });
    const result = groupEnvMap(env, { delimiter: '.' });
    expect(result.groups['DB'].size).toBe(2);
  });

  it('returns empty groups for empty map', () => {
    const result = groupEnvMap(new Map());
    expect(Object.keys(result.groups).length).toBe(0);
    expect(result.ungrouped.size).toBe(0);
  });
});

describe('flattenGroupedEnvMap', () => {
  it('flattens grouped map back to flat map', () => {
    const env = makeMap({ DB_HOST: 'localhost', DB_PORT: '5432', PORT: '3000' });
    const grouped = groupEnvMap(env);
    const flat = flattenGroupedEnvMap(grouped);
    expect(flat.get('DB_HOST')).toBe('localhost');
    expect(flat.get('DB_PORT')).toBe('5432');
    expect(flat.get('PORT')).toBe('3000');
  });
});

describe('formatGroupReport', () => {
  it('returns a formatted report string', () => {
    const env = makeMap({ DB_HOST: 'localhost', PORT: '3000' });
    const grouped = groupEnvMap(env);
    const report = formatGroupReport(grouped);
    expect(report).toContain('Env Group Report');
    expect(report).toContain('[DB]');
    expect(report).toContain('DB_HOST');
    expect(report).toContain('[ungrouped]');
  });
});
