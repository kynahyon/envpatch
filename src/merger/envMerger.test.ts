import { mergeEnvMaps } from './envMerger';
import { EnvMap } from '../parser/types';

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { key, value, comment: undefined, lineNumber: 0 });
  }
  return map;
}

describe('mergeEnvMaps', () => {
  it('adds new keys from patch to base', () => {
    const base = makeMap({ FOO: 'foo' });
    const patch = makeMap({ BAR: 'bar' });
    const { merged } = mergeEnvMaps(base, patch);
    expect(merged.get('FOO')?.value).toBe('foo');
    expect(merged.get('BAR')?.value).toBe('bar');
  });

  it('patch-wins strategy overwrites conflicting keys', () => {
    const base = makeMap({ FOO: 'original' });
    const patch = makeMap({ FOO: 'patched' });
    const { merged, appliedKeys, skippedKeys } = mergeEnvMaps(base, patch, 'patch-wins');
    expect(merged.get('FOO')?.value).toBe('patched');
    expect(appliedKeys).toContain('FOO');
    expect(skippedKeys).toHaveLength(0);
  });

  it('base-wins strategy keeps base value on conflict', () => {
    const base = makeMap({ FOO: 'original' });
    const patch = makeMap({ FOO: 'patched' });
    const { merged, skippedKeys } = mergeEnvMaps(base, patch, 'base-wins');
    expect(merged.get('FOO')?.value).toBe('original');
    expect(skippedKeys).toContain('FOO');
  });

  it('error strategy throws when conflicts exist', () => {
    const base = makeMap({ FOO: 'original' });
    const patch = makeMap({ FOO: 'patched' });
    expect(() => mergeEnvMaps(base, patch, 'error')).toThrow(/Merge aborted/);
  });

  it('error strategy succeeds when there are no conflicts', () => {
    const base = makeMap({ FOO: 'foo' });
    const patch = makeMap({ BAR: 'bar' });
    const { merged } = mergeEnvMaps(base, patch, 'error');
    expect(merged.size).toBe(2);
  });

  it('returns detected conflicts in result', () => {
    const base = makeMap({ FOO: 'a', BAR: 'b' });
    const patch = makeMap({ FOO: 'x', BAR: 'y' });
    const { conflicts } = mergeEnvMaps(base, patch);
    expect(conflicts).toHaveLength(2);
  });
});
