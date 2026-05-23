import { freezeEnvMap, formatFreezeReport, isFrozenKey } from './envFreezer';
import { EnvMap } from '../parser/types';

function makeMap(obj: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(obj)) {
    map.set(key, { value, comment: undefined, quoted: false });
  }
  return map;
}

describe('isFrozenKey', () => {
  it('matches exact keys', () => {
    expect(isFrozenKey('DB_PASS', { keys: ['DB_PASS'] })).toBe(true);
    expect(isFrozenKey('DB_USER', { keys: ['DB_PASS'] })).toBe(false);
  });

  it('matches by prefix', () => {
    expect(isFrozenKey('PROD_HOST', { prefixes: ['PROD_'] })).toBe(true);
    expect(isFrozenKey('DEV_HOST', { prefixes: ['PROD_'] })).toBe(false);
  });

  it('returns false when no options given', () => {
    expect(isFrozenKey('ANY_KEY', {})).toBe(false);
  });
});

describe('freezeEnvMap', () => {
  const base = makeMap({ DB_PASS: 'secret', DB_USER: 'admin', APP_PORT: '3000' });

  it('identifies frozen keys', () => {
    const result = freezeEnvMap(base, makeMap({}), { keys: ['DB_PASS'] });
    expect(result.frozen.has('DB_PASS')).toBe(true);
    expect(result.skipped).toContain('DB_USER');
  });

  it('detects violations when candidate changes a frozen key', () => {
    const candidate = makeMap({ DB_PASS: 'hacked' });
    const result = freezeEnvMap(base, candidate, { keys: ['DB_PASS'] });
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].key).toBe('DB_PASS');
    expect(result.violations[0].attemptedValue).toBe('hacked');
  });

  it('does not flag a violation when value is unchanged', () => {
    const candidate = makeMap({ DB_PASS: 'secret' });
    const result = freezeEnvMap(base, candidate, { keys: ['DB_PASS'] });
    expect(result.violations).toHaveLength(0);
  });

  it('freezes by prefix', () => {
    const candidate = makeMap({ DB_PASS: 'changed', DB_USER: 'root' });
    const result = freezeEnvMap(base, candidate, { prefixes: ['DB_'] });
    expect(result.frozen.size).toBe(2);
    expect(result.violations).toHaveLength(2);
  });
});

describe('formatFreezeReport', () => {
  it('includes violation details', () => {
    const base = makeMap({ SECRET: 'abc' });
    const candidate = makeMap({ SECRET: 'xyz' });
    const result = freezeEnvMap(base, candidate, { keys: ['SECRET'] });
    const report = formatFreezeReport(result);
    expect(report).toContain('Violations  : 1');
    expect(report).toContain('[SECRET]');
    expect(report).toContain('blocked');
  });

  it('shows zero violations when clean', () => {
    const result = freezeEnvMap(makeMap({ X: '1' }), makeMap({}), { keys: ['X'] });
    const report = formatFreezeReport(result);
    expect(report).toContain('Violations  : 0');
  });
});
