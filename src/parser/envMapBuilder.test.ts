import { buildEnvMap, serializeEnvMap } from './envMapBuilder';
import { EnvEntry } from './types';

const makeEntry = (key: string, value: string, line = 1): EnvEntry => ({
  key,
  value,
  source: 'test.env',
  lineNumber: line,
});

describe('buildEnvMap', () => {
  it('builds a flat map from entries', () => {
    const entries = [makeEntry('FOO', 'bar'), makeEntry('BAZ', 'qux')];
    const { map, duplicates } = buildEnvMap(entries);
    expect(map).toEqual({ FOO: 'bar', BAZ: 'qux' });
    expect(duplicates).toHaveLength(0);
  });

  it('reports duplicate keys', () => {
    const entries = [makeEntry('FOO', 'first', 1), makeEntry('FOO', 'second', 5)];
    const { map, duplicates } = buildEnvMap(entries);
    expect(map['FOO']).toBe('second');
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0]).toContain('FOO');
  });
});

describe('serializeEnvMap', () => {
  it('serialises a map to .env format', () => {
    const map = { FOO: 'bar', BAZ: 'qux' };
    const output = serializeEnvMap(map);
    expect(output).toBe('FOO=bar\nBAZ=qux');
  });

  it('wraps values with spaces in double quotes', () => {
    const map = { MESSAGE: 'hello world' };
    const output = serializeEnvMap(map);
    expect(output).toBe('MESSAGE="hello world"');
  });

  it('wraps values containing # in double quotes', () => {
    const map = { COLOR: '#ffffff' };
    const output = serializeEnvMap(map);
    expect(output).toBe('COLOR="#ffffff"');
  });
});
