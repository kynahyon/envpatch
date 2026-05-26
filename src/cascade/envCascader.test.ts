import { cascadeEnvMaps, formatCascadeReport } from './envCascader';
import { EnvMap } from '../parser/types';
import { CascadeLayer } from './types';

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { value, comment: undefined });
  }
  return map;
}

const base: CascadeLayer = { name: 'base', priority: 1 };
const staging: CascadeLayer = { name: 'staging', priority: 2 };
const prod: CascadeLayer = { name: 'prod', priority: 3 };

describe('cascadeEnvMaps', () => {
  it('resolves keys from a single layer', () => {
    const result = cascadeEnvMaps([
      { map: makeMap({ FOO: 'bar' }), layer: base },
    ]);
    expect(result.resolved.get('FOO')?.value).toBe('bar');
    expect(result.overrides).toHaveLength(0);
  });

  it('higher priority layer wins on conflict', () => {
    const result = cascadeEnvMaps([
      { map: makeMap({ DB_URL: 'base-db' }), layer: base },
      { map: makeMap({ DB_URL: 'prod-db' }), layer: prod },
    ]);
    expect(result.resolved.get('DB_URL')?.value).toBe('prod-db');
    expect(result.resolved.get('DB_URL')?.source).toBe('prod');
  });

  it('records overrides correctly', () => {
    const result = cascadeEnvMaps([
      { map: makeMap({ KEY: 'v1' }), layer: base },
      { map: makeMap({ KEY: 'v2' }), layer: staging },
      { map: makeMap({ KEY: 'v3' }), layer: prod },
    ]);
    expect(result.overrides).toHaveLength(1);
    expect(result.overrides[0].winner.value).toBe('v3');
    expect(result.overrides[0].losers).toHaveLength(2);
  });

  it('merges keys unique to each layer', () => {
    const result = cascadeEnvMaps([
      { map: makeMap({ A: '1' }), layer: base },
      { map: makeMap({ B: '2' }), layer: prod },
    ]);
    expect(result.resolved.size).toBe(2);
    expect(result.resolved.get('A')?.value).toBe('1');
    expect(result.resolved.get('B')?.value).toBe('2');
  });

  it('returns layers sorted by priority', () => {
    const result = cascadeEnvMaps([
      { map: makeMap({}), layer: prod },
      { map: makeMap({}), layer: base },
    ]);
    expect(result.layers[0].name).toBe('base');
    expect(result.layers[1].name).toBe('prod');
  });
});

describe('formatCascadeReport', () => {
  it('reports no overrides when all keys are unique', () => {
    const result = cascadeEnvMaps([
      { map: makeMap({ A: '1' }), layer: base },
      { map: makeMap({ B: '2' }), layer: prod },
    ]);
    const report = formatCascadeReport(result);
    expect(report).toContain('No overrides detected.');
  });

  it('reports override details', () => {
    const result = cascadeEnvMaps([
      { map: makeMap({ SECRET: 'old' }), layer: base },
      { map: makeMap({ SECRET: 'new' }), layer: prod },
    ]);
    const report = formatCascadeReport(result);
    expect(report).toContain('SECRET');
    expect(report).toContain('prod');
    expect(report).toContain('base');
  });
});
