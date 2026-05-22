import { diffEnvMaps, formatDiffReport } from './envDiffer';
import { EnvMap } from '../parser/types';

function makeMap(obj: Record<string, string>): EnvMap {
  return new Map(Object.entries(obj));
}

describe('diffEnvMaps', () => {
  it('detects added keys', () => {
    const base = makeMap({ A: '1' });
    const target = makeMap({ A: '1', B: '2' });
    const diff = diffEnvMaps(base, target);
    expect(diff.addedCount).toBe(1);
    expect(diff.entries).toContainEqual({ key: 'B', operation: 'added', newValue: '2' });
  });

  it('detects removed keys', () => {
    const base = makeMap({ A: '1', B: '2' });
    const target = makeMap({ A: '1' });
    const diff = diffEnvMaps(base, target);
    expect(diff.removedCount).toBe(1);
    expect(diff.entries).toContainEqual({ key: 'B', operation: 'removed', oldValue: '2' });
  });

  it('detects changed keys', () => {
    const base = makeMap({ A: 'old' });
    const target = makeMap({ A: 'new' });
    const diff = diffEnvMaps(base, target);
    expect(diff.changedCount).toBe(1);
    expect(diff.entries[0]).toMatchObject({ key: 'A', operation: 'changed', oldValue: 'old', newValue: 'new' });
  });

  it('counts unchanged keys', () => {
    const base = makeMap({ A: '1', B: '2' });
    const target = makeMap({ A: '1', B: '2' });
    const diff = diffEnvMaps(base, target);
    expect(diff.unchangedCount).toBe(2);
    expect(diff.entries).toHaveLength(0);
  });

  it('includes unchanged when option is set', () => {
    const base = makeMap({ A: '1' });
    const target = makeMap({ A: '1' });
    const diff = diffEnvMaps(base, target, { includeUnchanged: true });
    expect(diff.entries).toHaveLength(1);
    expect(diff.entries[0].operation).toBe('unchanged');
  });

  it('ignores specified keys', () => {
    const base = makeMap({ A: '1', SECRET: 'old' });
    const target = makeMap({ A: '2', SECRET: 'new' });
    const diff = diffEnvMaps(base, target, { ignoreKeys: ['SECRET'] });
    expect(diff.entries.find(e => e.key === 'SECRET')).toBeUndefined();
    expect(diff.changedCount).toBe(1);
  });
});

describe('formatDiffReport', () => {
  it('formats a diff report with all operation types', () => {
    const base = makeMap({ A: 'old', C: 'same', D: 'gone' });
    const target = makeMap({ A: 'new', B: 'added', C: 'same' });
    const diff = diffEnvMaps(base, target);
    const report = formatDiffReport(diff);
    expect(report).toContain('+1 added');
    expect(report).toContain('-1 removed');
    expect(report).toContain('~1 changed');
    expect(report).toContain('+ B=added');
    expect(report).toContain('- D=gone');
    expect(report).toContain('~ A: "old" → "new"');
  });
});
