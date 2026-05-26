import { checkBoundaries, formatBoundaryReport } from './envBoundary';
import { EnvMap } from '../parser/types';

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { key, value, comment: undefined, quoted: false });
  }
  return map;
}

describe('checkBoundaries', () => {
  it('passes when all values satisfy rules', () => {
    const map = makeMap({ PORT: '8080', NAME: 'myapp' });
    const result = checkBoundaries(map, [
      { key: 'PORT', minValue: 1024, maxValue: 65535 },
      { key: 'NAME', minLength: 3, maxLength: 20 },
    ]);
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.checkedCount).toBe(2);
  });

  it('detects minLength violation', () => {
    const map = makeMap({ NAME: 'ab' });
    const result = checkBoundaries(map, [{ key: 'NAME', minLength: 5 }]);
    expect(result.valid).toBe(false);
    expect(result.violations[0].rule).toBe('minLength');
  });

  it('detects maxLength violation', () => {
    const map = makeMap({ TOKEN: 'averylongtokenvalue' });
    const result = checkBoundaries(map, [{ key: 'TOKEN', maxLength: 10 }]);
    expect(result.valid).toBe(false);
    expect(result.violations[0].rule).toBe('maxLength');
  });

  it('detects minValue violation', () => {
    const map = makeMap({ PORT: '80' });
    const result = checkBoundaries(map, [{ key: 'PORT', minValue: 1024 }]);
    expect(result.valid).toBe(false);
    expect(result.violations[0].rule).toBe('minValue');
  });

  it('detects maxValue violation', () => {
    const map = makeMap({ TIMEOUT: '99999' });
    const result = checkBoundaries(map, [{ key: 'TIMEOUT', maxValue: 30000 }]);
    expect(result.valid).toBe(false);
    expect(result.violations[0].rule).toBe('maxValue');
  });

  it('detects pattern violation', () => {
    const map = makeMap({ EMAIL: 'not-an-email' });
    const result = checkBoundaries(map, [{ key: 'EMAIL', pattern: /^[^@]+@[^@]+$/ }]);
    expect(result.valid).toBe(false);
    expect(result.violations[0].rule).toBe('pattern');
  });

  it('skips keys not present in map', () => {
    const map = makeMap({ PORT: '3000' });
    const result = checkBoundaries(map, [{ key: 'MISSING_KEY', minLength: 1 }]);
    expect(result.valid).toBe(true);
    expect(result.checkedCount).toBe(0);
  });
});

describe('formatBoundaryReport', () => {
  it('formats a passing report', () => {
    const result = { valid: true, violations: [], checkedCount: 3, violationCount: 0 };
    const report = formatBoundaryReport(result);
    expect(report).toContain('PASSED');
    expect(report).toContain('Checked: 3');
  });

  it('formats a failing report with violations', () => {
    const result = {
      valid: false,
      violations: [{ key: 'PORT', value: '80', rule: 'minValue', detail: 'Value 80 is below minimum 1024' }],
      checkedCount: 1,
      violationCount: 1,
    };
    const report = formatBoundaryReport(result);
    expect(report).toContain('FAILED');
    expect(report).toContain('[minValue]');
    expect(report).toContain('PORT');
  });
});
