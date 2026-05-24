import { trimEnvMap, formatTrimReport } from './envTrimmer';
import { EnvMap } from '../parser/types';

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { value, comment: undefined, quoted: false });
  }
  return map;
}

describe('trimEnvMap', () => {
  it('trims values by default', () => {
    const env = makeMap({ KEY: '  hello  ', OTHER: 'world' });
    const { trimmed, modifiedKeys, removedKeys } = trimEnvMap(env);
    expect(trimmed.get('KEY')?.value).toBe('hello');
    expect(trimmed.get('OTHER')?.value).toBe('world');
    expect(modifiedKeys).toEqual(['KEY']);
    expect(removedKeys).toHaveLength(0);
  });

  it('does not trim values when trimValues is false', () => {
    const env = makeMap({ KEY: '  hello  ' });
    const { trimmed, modifiedKeys } = trimEnvMap(env, { trimValues: false });
    expect(trimmed.get('KEY')?.value).toBe('  hello  ');
    expect(modifiedKeys).toHaveLength(0);
  });

  it('removes empty values when removeEmpty is true', () => {
    const env = makeMap({ EMPTY: '   ', VALID: 'ok' });
    const { trimmed, removedKeys } = trimEnvMap(env, { removeEmpty: true });
    expect(trimmed.has('EMPTY')).toBe(false);
    expect(trimmed.has('VALID')).toBe(true);
    expect(removedKeys).toContain('EMPTY');
  });

  it('preserves original map unchanged', () => {
    const env = makeMap({ KEY: '  value  ' });
    trimEnvMap(env);
    expect(env.get('KEY')?.value).toBe('  value  ');
  });

  it('returns no changes for already-trimmed map', () => {
    const env = makeMap({ A: 'clean', B: 'also-clean' });
    const { modifiedKeys, removedKeys } = trimEnvMap(env);
    expect(modifiedKeys).toHaveLength(0);
    expect(removedKeys).toHaveLength(0);
  });
});

describe('formatTrimReport', () => {
  it('reports no changes when nothing was trimmed', () => {
    const env = makeMap({ A: 'clean' });
    const result = trimEnvMap(env);
    const report = formatTrimReport(result);
    expect(report).toContain('No changes made.');
  });

  it('reports modified keys', () => {
    const env = makeMap({ KEY: ' value ' });
    const result = trimEnvMap(env);
    const report = formatTrimReport(result);
    expect(report).toContain('Modified');
    expect(report).toContain('KEY');
    expect(report).toContain('" value "');
    expect(report).toContain('"value"');
  });

  it('reports removed keys', () => {
    const env = makeMap({ EMPTY: '  ' });
    const result = trimEnvMap(env, { removeEmpty: true });
    const report = formatTrimReport(result);
    expect(report).toContain('Removed empty');
    expect(report).toContain('EMPTY');
  });
});
