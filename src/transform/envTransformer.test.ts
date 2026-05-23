import { applyTransformRules, formatTransformReport } from './envTransformer';
import { EnvMap } from '../parser/types';

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { value, comment: undefined, quoted: false });
  }
  return map;
}

describe('applyTransformRules', () => {
  it('applies a string key rule', () => {
    const map = makeMap({ API_URL: 'http://localhost' });
    const { result, report } = applyTransformRules(map, [
      { key: 'API_URL', transform: (_, v) => v.toUpperCase(), description: 'uppercase' },
    ]);
    expect(result.get('API_URL')?.value).toBe('HTTP://LOCALHOST');
    expect(report.applied).toHaveLength(1);
    expect(report.applied[0].ruleApplied).toBe('uppercase');
  });

  it('applies a regex key rule', () => {
    const map = makeMap({ DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'myapp' });
    const { result, report } = applyTransformRules(map, [
      { key: /^DB_/, transform: (_, v) => v + '_transformed', description: 'db-prefix' },
    ]);
    expect(result.get('DB_HOST')?.value).toBe('localhost_transformed');
    expect(result.get('DB_PORT')?.value).toBe('5432_transformed');
    expect(result.get('APP_NAME')?.value).toBe('myapp');
    expect(report.applied).toHaveLength(2);
    expect(report.skipped).toContain('APP_NAME');
  });

  it('uses first matching rule only', () => {
    const map = makeMap({ KEY: 'value' });
    const { result } = applyTransformRules(map, [
      { key: 'KEY', transform: (_, v) => 'first', description: 'first' },
      { key: 'KEY', transform: (_, v) => 'second', description: 'second' },
    ]);
    expect(result.get('KEY')?.value).toBe('first');
  });

  it('preserves original map immutably', () => {
    const map = makeMap({ X: 'original' });
    applyTransformRules(map, [{ key: 'X', transform: () => 'changed' }]);
    expect(map.get('X')?.value).toBe('original');
  });

  it('reports skipped keys when no rule matches', () => {
    const map = makeMap({ FOO: 'bar' });
    const { report } = applyTransformRules(map, []);
    expect(report.skipped).toContain('FOO');
    expect(report.applied).toHaveLength(0);
  });
});

describe('formatTransformReport', () => {
  it('formats a report with applied and skipped keys', () => {
    const report = {
      applied: [{ key: 'A', originalValue: 'x', transformedValue: 'X', ruleApplied: 'upper' }],
      skipped: ['B'],
      totalKeys: 2,
    };
    const output = formatTransformReport(report);
    expect(output).toContain('Transform Report (2 keys total)');
    expect(output).toContain('[upper] A: "x" -> "X"');
    expect(output).toContain('B');
  });
});
