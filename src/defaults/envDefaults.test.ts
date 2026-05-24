import { applyDefaults, formatDefaultsReport } from './envDefaults';
import { EnvMap } from '../parser/types';

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { value, comment: undefined, quoted: false });
  }
  return map;
}

describe('applyDefaults', () => {
  it('fills in missing keys from defaults', () => {
    const target = makeMap({ A: '1' });
    const defaults = makeMap({ A: '99', B: '2', C: '3' });
    const { result, applied, skipped } = applyDefaults(target, defaults);

    expect(result.get('A')?.value).toBe('1'); // preserved
    expect(result.get('B')?.value).toBe('2'); // applied
    expect(result.get('C')?.value).toBe('3'); // applied
    expect(applied).toEqual(['B', 'C']);
    expect(skipped).toEqual(['A']);
  });

  it('overwrites existing keys when preserveExisting is false', () => {
    const target = makeMap({ A: '1' });
    const defaults = makeMap({ A: '99', B: '2' });
    const { result, applied } = applyDefaults(target, defaults, { preserveExisting: false });

    expect(result.get('A')?.value).toBe('99');
    expect(applied).toContain('A');
    expect(applied).toContain('B');
  });

  it('skips unknown keys when onlyKnownKeys is true', () => {
    const target = makeMap({ A: '1' });
    const defaults = makeMap({ A: '99', B: '2' });
    const { result, applied, skipped } = applyDefaults(target, defaults, { onlyKnownKeys: true });

    expect(result.has('B')).toBe(false);
    expect(skipped).toContain('B');
    expect(applied).toHaveLength(0); // A was skipped due to preserveExisting
  });

  it('returns empty applied and skipped for empty defaults', () => {
    const target = makeMap({ A: '1' });
    const { applied, skipped } = applyDefaults(target, new Map());
    expect(applied).toHaveLength(0);
    expect(skipped).toHaveLength(0);
  });
});

describe('formatDefaultsReport', () => {
  it('includes applied and skipped keys', () => {
    const target = makeMap({ A: '1' });
    const defaults = makeMap({ A: '99', B: '2' });
    const result = applyDefaults(target, defaults);
    const report = formatDefaultsReport(result);

    expect(report).toContain('Applied');
    expect(report).toContain('+ B');
    expect(report).toContain('Skipped');
    expect(report).toContain('- A');
  });

  it('shows none when nothing applied', () => {
    const target = makeMap({ A: '1' });
    const result = applyDefaults(target, new Map());
    const report = formatDefaultsReport(result);
    expect(report).toContain('Applied (0): none');
  });
});
