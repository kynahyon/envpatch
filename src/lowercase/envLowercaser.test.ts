import { lowercaseEnvKeys, formatLowercaseReport } from './envLowercaser';
import { EnvMap, EnvEntry } from '../parser/types';

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { key, value, comment: undefined, raw: `${key}=${value}` } as EnvEntry);
  }
  return map;
}

describe('lowercaseEnvKeys', () => {
  it('lowercases all uppercase keys', () => {
    const map = makeMap({ FOO: 'bar', BAZ: 'qux' });
    const { result } = lowercaseEnvKeys(map);
    expect(result.has('foo')).toBe(true);
    expect(result.has('baz')).toBe(true);
    expect(result.has('FOO')).toBe(false);
    expect(result.get('foo')?.value).toBe('bar');
  });

  it('leaves already-lowercase keys unchanged', () => {
    const map = makeMap({ foo: 'bar', baz: 'qux' });
    const { result, report } = lowercaseEnvKeys(map);
    expect(result.has('foo')).toBe(true);
    expect(report.renamedKeys).toHaveLength(0);
  });

  it('handles mixed-case keys', () => {
    const map = makeMap({ FooBar: '1', HELLO_WORLD: '2' });
    const { result, report } = lowercaseEnvKeys(map);
    expect(result.has('foobar')).toBe(true);
    expect(result.has('hello_world')).toBe(true);
    expect(report.renamedKeys).toContain('FooBar');
    expect(report.renamedKeys).toContain('HELLO_WORLD');
  });

  it('skips colliding keys by default', () => {
    // FOO and foo would both map to 'foo'
    const map = makeMap({ FOO: 'upper', foo: 'lower' });
    const { result, report } = lowercaseEnvKeys(map);
    // Both kept as-is because of collision
    expect(report.skippedKeys.length).toBeGreaterThan(0);
    expect(result.size).toBe(2);
  });

  it('overwrites on collision when overwriteOnCollision is true', () => {
    const map = makeMap({ FOO: 'upper', foo: 'lower' });
    const { result } = lowercaseEnvKeys(map, { overwriteOnCollision: true });
    expect(result.has('foo')).toBe(true);
    // Last write wins — map iteration order is insertion order
    expect(result.size).toBe(1);
  });

  it('updates the key field inside the entry', () => {
    const map = makeMap({ MYKEY: 'value' });
    const { result } = lowercaseEnvKeys(map);
    expect(result.get('mykey')?.key).toBe('mykey');
  });

  it('returns correct report counts', () => {
    const map = makeMap({ A: '1', b: '2', C: '3' });
    const { report } = lowercaseEnvKeys(map);
    expect(report.totalKeys).toBe(3);
    expect(report.renamedKeys).toHaveLength(2);
    expect(report.skippedKeys).toHaveLength(0);
  });
});

describe('formatLowercaseReport', () => {
  it('formats a report with renamed keys', () => {
    const map = makeMap({ FOO: 'bar', BAZ: 'qux' });
    const { report } = lowercaseEnvKeys(map);
    const text = formatLowercaseReport(report);
    expect(text).toContain('Lowercase Report');
    expect(text).toContain('Renamed');
    expect(text).toContain('FOO');
  });

  it('formats a report with no changes', () => {
    const map = makeMap({ foo: 'bar' });
    const { report } = lowercaseEnvKeys(map);
    const text = formatLowercaseReport(report);
    expect(text).toContain('Renamed      : 0');
  });
});
