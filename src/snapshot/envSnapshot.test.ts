import { createSnapshot, restoreSnapshot, formatSnapshotReport } from './envSnapshot';
import { EnvMap } from '../parser/types';

function makeMap(pairs: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(pairs)) {
    map.set(key, { value });
  }
  return map;
}

describe('createSnapshot', () => {
  it('captures all keys and values from the map', () => {
    const map = makeMap({ DB_HOST: 'localhost', DB_PORT: '5432' });
    const snapshot = createSnapshot(map, 'test-snap');

    expect(snapshot.label).toBe('test-snap');
    expect(snapshot.entries).toHaveLength(2);
    expect(snapshot.entries.find(e => e.key === 'DB_HOST')?.value).toBe('localhost');
    expect(snapshot.entries.find(e => e.key === 'DB_PORT')?.value).toBe('5432');
  });

  it('generates a default label when none is provided', () => {
    const map = makeMap({ FOO: 'bar' });
    const snapshot = createSnapshot(map);
    expect(snapshot.label).toMatch(/^snapshot-\d+$/);
  });

  it('sets a valid ISO timestamp', () => {
    const map = makeMap({ X: '1' });
    const snapshot = createSnapshot(map);
    expect(() => new Date(snapshot.createdAt)).not.toThrow();
    expect(new Date(snapshot.createdAt).toISOString()).toBe(snapshot.createdAt);
  });
});

describe('restoreSnapshot', () => {
  it('restores an EnvMap that matches the original', () => {
    const original = makeMap({ API_KEY: 'secret', TIMEOUT: '30' });
    const snapshot = createSnapshot(original, 'restore-test');
    const restored = restoreSnapshot(snapshot);

    expect(restored.size).toBe(2);
    expect(restored.get('API_KEY')?.value).toBe('secret');
    expect(restored.get('TIMEOUT')?.value).toBe('30');
  });

  it('round-trips correctly for an empty map', () => {
    const map: EnvMap = new Map();
    const snapshot = createSnapshot(map, 'empty');
    const restored = restoreSnapshot(snapshot);
    expect(restored.size).toBe(0);
  });
});

describe('formatSnapshotReport', () => {
  it('includes label, timestamp and entries in output', () => {
    const map = makeMap({ NODE_ENV: 'production' });
    const snapshot = createSnapshot(map, 'prod-snap');
    const report = formatSnapshotReport(snapshot);

    expect(report).toContain('prod-snap');
    expect(report).toContain('NODE_ENV=production');
    expect(report).toContain('Entries:  1');
  });
});
