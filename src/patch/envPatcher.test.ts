import { applyPatch, formatPatchReport } from './envPatcher';
import { EnvMap } from '../parser/types';

function makeMap(obj: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(obj)) {
    map.set(key, { key, value, comment: undefined, quoted: false });
  }
  return map;
}

describe('applyPatch', () => {
  it('adds new keys from source to target', () => {
    const target = makeMap({ A: '1' });
    const source = makeMap({ B: '2' });
    const result = applyPatch(target, source);
    expect(result.addedCount).toBe(1);
    expect(target.get('B')?.value).toBe('2');
  });

  it('updates existing keys when overwrite is true', () => {
    const target = makeMap({ A: 'old' });
    const source = makeMap({ A: 'new' });
    const result = applyPatch(target, source, { overwrite: true });
    expect(result.updatedCount).toBe(1);
    expect(target.get('A')?.value).toBe('new');
  });

  it('skips existing keys when overwrite is false', () => {
    const target = makeMap({ A: 'old' });
    const source = makeMap({ A: 'new' });
    const result = applyPatch(target, source, { overwrite: false });
    expect(result.skippedCount).toBe(1);
    expect(target.get('A')?.value).toBe('old');
  });

  it('prunes keys not in source when prune is true', () => {
    const target = makeMap({ A: '1', B: '2' });
    const source = makeMap({ A: '1' });
    const result = applyPatch(target, source, { prune: true });
    expect(result.deletedCount).toBe(1);
    expect(target.has('B')).toBe(false);
  });

  it('excludes specified keys from patching', () => {
    const target = makeMap({ A: 'old' });
    const source = makeMap({ A: 'new' });
    const result = applyPatch(target, source, { excludeKeys: ['A'] });
    expect(result.skippedCount).toBe(1);
    expect(target.get('A')?.value).toBe('old');
  });

  it('does not mutate target on dry run', () => {
    const target = makeMap({ A: '1' });
    const source = makeMap({ B: '2' });
    applyPatch(target, source, { dryRun: true });
    expect(target.has('B')).toBe(false);
  });
});

describe('formatPatchReport', () => {
  it('returns a formatted summary string', () => {
    const target = makeMap({ A: 'old' });
    const source = makeMap({ A: 'new', B: '2' });
    const result = applyPatch(target, source, { dryRun: true });
    const report = formatPatchReport(result);
    expect(report).toContain('+1 added');
    expect(report).toContain('~1 updated');
    expect(report).toContain('[+] B');
    expect(report).toContain('[~] A');
  });
});
