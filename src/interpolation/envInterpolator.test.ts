import { interpolateEnvMap, formatInterpolationReport } from './envInterpolator';

const makeMap = (obj: Record<string, string>): Map<string, string> =>
  new Map(Object.entries(obj));

describe('interpolateEnvMap', () => {
  it('resolves simple variable references', () => {
    const map = makeMap({ BASE: '/home/user', PATH: '${BASE}/bin' });
    const { resolved } = interpolateEnvMap(map);
    expect(resolved.get('PATH')).toBe('/home/user/bin');
  });

  it('resolves $VAR style references', () => {
    const map = makeMap({ HOST: 'localhost', URL: 'http://$HOST:3000' });
    const { resolved } = interpolateEnvMap(map);
    expect(resolved.get('URL')).toBe('http://localhost:3000');
  });

  it('resolves nested references', () => {
    const map = makeMap({ A: 'hello', B: '${A} world', C: '${B}!' });
    const { resolved } = interpolateEnvMap(map);
    expect(resolved.get('C')).toBe('hello world!');
  });

  it('leaves unresolvable references as-is', () => {
    const map = makeMap({ KEY: '${UNDEFINED_VAR}/path' });
    const { resolved, unresolved } = interpolateEnvMap(map);
    expect(resolved.get('KEY')).toBe('${UNDEFINED_VAR}/path');
    expect(unresolved).toContain('KEY');
  });

  it('detects cyclic references', () => {
    const map = makeMap({ A: '${B}', B: '${A}' });
    const { cycles } = interpolateEnvMap(map);
    expect(cycles.length).toBeGreaterThan(0);
  });

  it('handles maps with no interpolation', () => {
    const map = makeMap({ FOO: 'bar', BAZ: 'qux' });
    const { resolved, unresolved, cycles } = interpolateEnvMap(map);
    expect(resolved.get('FOO')).toBe('bar');
    expect(unresolved).toHaveLength(0);
    expect(cycles).toHaveLength(0);
  });

  it('respects strict mode for unresolved vars', () => {
    const map = makeMap({ KEY: '${MISSING}' });
    const { unresolved } = interpolateEnvMap(map, { strict: true });
    expect(unresolved).toContain('KEY');
  });

  it('handles empty map', () => {
    const { resolved, unresolved, cycles } = interpolateEnvMap(new Map());
    expect(resolved.size).toBe(0);
    expect(unresolved).toHaveLength(0);
    expect(cycles).toHaveLength(0);
  });
});

describe('formatInterpolationReport', () => {
  it('reports success when all resolved', () => {
    const map = new Map([['A', 'hello']]);
    const result = interpolateEnvMap(map);
    const report = formatInterpolationReport(result);
    expect(report).toContain('All variables resolved successfully.');
  });

  it('reports unresolved keys', () => {
    const map = new Map([['A', '${MISSING}']]);
    const result = interpolateEnvMap(map);
    const report = formatInterpolationReport(result);
    expect(report).toContain('Unresolved');
    expect(report).toContain('A');
  });

  it('reports cycles', () => {
    const map = new Map([['X', '${Y}'], ['Y', '${X}']]);
    const result = interpolateEnvMap(map);
    const report = formatInterpolationReport(result);
    expect(report).toContain('Cycles detected');
  });
});
