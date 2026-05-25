import { coerceEnvMap, formatCoerceReport } from './envCoercer';
import { EnvMap, EnvEntry } from '../parser/types';

function makeMap(pairs: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(pairs)) {
    map.set(key, { key, value, comment: '' } as EnvEntry);
  }
  return map;
}

describe('coerceEnvMap', () => {
  it('coerces a number value', () => {
    const map = makeMap({ PORT: '3000' });
    const { envMap, report } = coerceEnvMap(map, [{ key: 'PORT', type: 'number' }]);
    expect(envMap.get('PORT')?.value).toBe('3000');
    expect(report.successCount).toBe(1);
    expect(report.failureCount).toBe(0);
  });

  it('fails to coerce non-numeric string to number', () => {
    const map = makeMap({ PORT: 'abc' });
    const { report } = coerceEnvMap(map, [{ key: 'PORT', type: 'number' }]);
    expect(report.failureCount).toBe(1);
    expect(report.results[0].error).toContain('Cannot coerce');
  });

  it('coerces truthy boolean variants', () => {
    for (const val of ['true', '1', 'yes', 'on']) {
      const map = makeMap({ FLAG: val });
      const { envMap } = coerceEnvMap(map, [{ key: 'FLAG', type: 'boolean' }]);
      expect(envMap.get('FLAG')?.value).toBe('true');
    }
  });

  it('coerces falsy boolean variants', () => {
    for (const val of ['false', '0', 'no', 'off']) {
      const map = makeMap({ FLAG: val });
      const { envMap } = coerceEnvMap(map, [{ key: 'FLAG', type: 'boolean' }]);
      expect(envMap.get('FLAG')?.value).toBe('false');
    }
  });

  it('fails to coerce invalid boolean', () => {
    const map = makeMap({ FLAG: 'maybe' });
    const { report } = coerceEnvMap(map, [{ key: 'FLAG', type: 'boolean' }]);
    expect(report.failureCount).toBe(1);
  });

  it('validates JSON successfully', () => {
    const map = makeMap({ CONFIG: '{"a":1}' });
    const { report } = coerceEnvMap(map, [{ key: 'CONFIG', type: 'json' }]);
    expect(report.successCount).toBe(1);
  });

  it('fails invalid JSON', () => {
    const map = makeMap({ CONFIG: '{bad}' });
    const { report } = coerceEnvMap(map, [{ key: 'CONFIG', type: 'json' }]);
    expect(report.failureCount).toBe(1);
  });

  it('skips keys not in the map', () => {
    const map = makeMap({ A: '1' });
    const { report } = coerceEnvMap(map, [{ key: 'MISSING', type: 'number' }]);
    expect(report.results).toHaveLength(0);
  });

  it('formatCoerceReport returns a string summary', () => {
    const map = makeMap({ PORT: '3000', FLAG: 'bad' });
    const { report } = coerceEnvMap(map, [
      { key: 'PORT', type: 'number' },
      { key: 'FLAG', type: 'boolean' },
    ]);
    const text = formatCoerceReport(report);
    expect(text).toContain('Coerce Report');
    expect(text).toContain('PORT');
    expect(text).toContain('FLAG');
  });
});
