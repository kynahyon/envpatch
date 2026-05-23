import {
  createHistoryEntry,
  pushHistory,
  peekHistory,
  rollbackHistory,
  formatHistoryReport,
} from './envHistory';
import { EnvHistory } from './types';
import { EnvMap } from '../parser/types';

function makeMap(obj: Record<string, string>): EnvMap {
  return new Map(
    Object.entries(obj).map(([k, v]) => [k, { key: k, value: v, raw: `${k}=${v}` }])
  );
}

const emptyHistory: EnvHistory = { entries: [] };

describe('createHistoryEntry', () => {
  it('creates an entry with the given label', () => {
    const map = makeMap({ FOO: 'bar' });
    const entry = createHistoryEntry(map, 'initial');
    expect(entry.label).toBe('initial');
    expect(entry.entries.get('FOO')?.value).toBe('bar');
    expect(entry.timestamp).toBeTruthy();
  });

  it('generates a default label when none is provided', () => {
    const entry = createHistoryEntry(makeMap({}));
    expect(entry.label).toMatch(/^snapshot-/);
  });

  it('stores a deep copy of the map so later mutations do not affect the entry', () => {
    const map = makeMap({ FOO: 'original' });
    const entry = createHistoryEntry(map, 'copy-test');
    // Mutate the source map after snapshot
    map.set('FOO', { key: 'FOO', value: 'mutated', raw: 'FOO=mutated' });
    expect(entry.entries.get('FOO')?.value).toBe('original');
  });
});

describe('pushHistory', () => {
  it('appends a new entry to history', () => {
    const h1 = pushHistory(emptyHistory, makeMap({ A: '1' }), 'first');
    expect(h1.entries).toHaveLength(1);
    const h2 = pushHistory(h1, makeMap({ A: '2' }), 'second');
    expect(h2.entries).toHaveLength(2);
  });

  it('does not mutate the original history object', () => {
    const h1 = pushHistory(emptyHistory, makeMap({ A: '1' }), 'first');
    pushHistory(h1, makeMap({ A: '2' }), 'second');
    expect(h1.entries).toHaveLength(1);
  });
});

describe('peekHistory', () => {
  it('returns undefined for empty history', () => {
    expect(peekHistory(emptyHistory)).toBeUndefined();
  });

  it('returns the last entry', () => {
    const h = pushHistory(
      pushHistory(emptyHistory, makeMap({ X: 'a' }), 'first'),
      makeMap({ X: 'b' }),
      'second'
    );
    expect(peekHistory(h)?.label).toBe('second');
  });
});

describe('rollbackHistory', () => {
  it('returns undefined when history has no entries', () => {
    expect(rollbackHistory(emptyHistory)).toBeUndefined();
  });

  it('returns undefined when only one entry exists', () => {
    const h = pushHistory(emptyHistory, makeMap({ A: '1' }), 'only');
    expect(rollbackHistory(h)).toBeUndefined();
  });

  it('restores the previous map state', () => {
    const h = pushHistory(
      pushHistory(emptyHistory, makeMap({ A: 'original' }), 'v1'),
      makeMap({ A: 'changed' }),
      'v2'
    );
    const result = rollbackHistory(h);
    expect(result?.map.get('A')?.value).toBe('original');
    expect(result?.history.entries).toHaveLength(1);
  });
});

describe('formatHistoryReport', () => {
  it('reports empty history', () => {
    expect(formatHistoryReport(emptyHistory)).toBe('No history recorded.');
  });

  it('lists all entries', () => {
    const h = pushHistory(emptyHistory, makeMap({ K: 'v' }), 'test-label');
    const report = formatHistoryReport(h);
    expect(report).toContain('test-label');
    expect(report).toContain('1 keys');
  });
});
