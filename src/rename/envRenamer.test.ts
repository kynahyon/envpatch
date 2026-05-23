import { renameEnvKeys, formatRenameReport, RenameRule } from './envRenamer';
import { EnvMap } from '../parser/types';

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { value, comment: undefined, quoted: false });
  }
  return map;
}

describe('renameEnvKeys', () => {
  it('renames a key that exists', () => {
    const map = makeMap({ OLD_KEY: 'value1', OTHER: 'value2' });
    const rules: RenameRule[] = [{ from: 'OLD_KEY', to: 'NEW_KEY' }];
    const result = renameEnvKeys(map, rules);
    expect(result.renamed).toHaveLength(1);
    expect(result.renamed[0]).toEqual({ from: 'OLD_KEY', to: 'NEW_KEY' });
    expect(result.output.has('NEW_KEY')).toBe(true);
    expect(result.output.has('OLD_KEY')).toBe(false);
    expect(result.output.get('NEW_KEY')?.value).toBe('value1');
  });

  it('records notFound when source key is missing', () => {
    const map = makeMap({ EXISTING: 'val' });
    const rules: RenameRule[] = [{ from: 'MISSING', to: 'DEST' }];
    const result = renameEnvKeys(map, rules);
    expect(result.notFound).toHaveLength(1);
    expect(result.notFound[0].from).toBe('MISSING');
    expect(result.output.has('DEST')).toBe(false);
  });

  it('skips rename when target key already exists', () => {
    const map = makeMap({ SOURCE: 'a', TARGET: 'b' });
    const rules: RenameRule[] = [{ from: 'SOURCE', to: 'TARGET' }];
    const result = renameEnvKeys(map, rules);
    expect(result.skipped).toHaveLength(1);
    expect(result.output.get('TARGET')?.value).toBe('b');
    expect(result.output.has('SOURCE')).toBe(true);
  });

  it('does not mutate the original map', () => {
    const map = makeMap({ KEY: 'val' });
    renameEnvKeys(map, [{ from: 'KEY', to: 'NEW_KEY' }]);
    expect(map.has('KEY')).toBe(true);
    expect(map.has('NEW_KEY')).toBe(false);
  });

  it('handles multiple rules correctly', () => {
    const map = makeMap({ A: '1', B: '2', C: '3' });
    const rules: RenameRule[] = [
      { from: 'A', to: 'X' },
      { from: 'B', to: 'Y' },
      { from: 'NOPE', to: 'Z' },
    ];
    const result = renameEnvKeys(map, rules);
    expect(result.renamed).toHaveLength(2);
    expect(result.notFound).toHaveLength(1);
    expect(result.output.has('X')).toBe(true);
    expect(result.output.has('Y')).toBe(true);
    expect(result.output.has('C')).toBe(true);
  });
});

describe('formatRenameReport', () => {
  it('includes renamed, skipped, and notFound sections', () => {
    const map = makeMap({ A: '1', B: '2' });
    const result = renameEnvKeys(map, [
      { from: 'A', to: 'X' },
      { from: 'B', to: 'B' },
      { from: 'MISSING', to: 'Y' },
    ]);
    const report = formatRenameReport(result);
    expect(report).toContain('Rename Report');
    expect(report).toContain('A -> X');
    expect(report).toContain('MISSING');
  });
});
