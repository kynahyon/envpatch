import { watchEnvMap, formatWatchReport } from './envWatcher';
import { EnvMap } from '../parser/types';

function makeMap(obj: Record<string, string>): EnvMap {
  const entries = new Map(
    Object.entries(obj).map(([key, value]) => [
      key,
      { key, value, comment: undefined, quoted: false },
    ])
  );
  return { entries };
}

describe('watchEnvMap', () => {
  it('detects added keys', () => {
    const prev = makeMap({ A: '1' });
    const curr = makeMap({ A: '1', B: '2' });
    const result = watchEnvMap(prev, curr);
    expect(result.addedCount).toBe(1);
    expect(result.events[0]).toMatchObject({ type: 'added', key: 'B', newValue: '2' });
  });

  it('detects removed keys', () => {
    const prev = makeMap({ A: '1', B: '2' });
    const curr = makeMap({ A: '1' });
    const result = watchEnvMap(prev, curr);
    expect(result.removedCount).toBe(1);
    expect(result.events[0]).toMatchObject({ type: 'removed', key: 'B', oldValue: '2' });
  });

  it('detects changed keys', () => {
    const prev = makeMap({ A: 'old' });
    const curr = makeMap({ A: 'new' });
    const result = watchEnvMap(prev, curr);
    expect(result.changedCount).toBe(1);
    expect(result.events[0]).toMatchObject({ type: 'changed', key: 'A', oldValue: 'old', newValue: 'new' });
  });

  it('ignores unchanged keys by default', () => {
    const prev = makeMap({ A: '1', B: '2' });
    const curr = makeMap({ A: '1', B: '2' });
    const result = watchEnvMap(prev, curr);
    expect(result.events).toHaveLength(0);
  });

  it('filters by specific keys', () => {
    const prev = makeMap({ A: '1', B: '2' });
    const curr = makeMap({ A: '9', B: '9' });
    const result = watchEnvMap(prev, curr, { keys: ['A'] });
    expect(result.events).toHaveLength(1);
    expect(result.events[0].key).toBe('A');
  });

  it('returns correct snapshots', () => {
    const prev = makeMap({ X: 'foo' });
    const curr = makeMap({ X: 'bar' });
    const result = watchEnvMap(prev, curr);
    expect(result.previousSnapshot.get('X')).toBe('foo');
    expect(result.currentSnapshot.get('X')).toBe('bar');
  });
});

describe('formatWatchReport', () => {
  it('reports no changes', () => {
    const prev = makeMap({ A: '1' });
    const curr = makeMap({ A: '1' });
    const result = watchEnvMap(prev, curr);
    const report = formatWatchReport(result);
    expect(report).toContain('No changes detected');
  });

  it('formats added, removed, changed events', () => {
    const prev = makeMap({ A: 'old', B: 'bye' });
    const curr = makeMap({ A: 'new', C: 'hello' });
    const result = watchEnvMap(prev, curr);
    const report = formatWatchReport(result);
    expect(report).toContain('+ C=hello');
    expect(report).toContain('- B=bye');
    expect(report).toContain('~ A: old -> new');
  });
});
