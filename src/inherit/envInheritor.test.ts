import { inheritEnvMap, formatInheritReport } from './envInheritor';

type EnvMap = Map<string, string>;

function makeMap(obj: Record<string, string>): EnvMap {
  return new Map(Object.entries(obj));
}

describe('inheritEnvMap', () => {
  it('inherits all keys from parent when inheritAll is true', () => {
    const parent = makeMap({ A: '1', B: '2', C: '3' });
    const child = makeMap({ A: 'child-a' });
    const result = inheritEnvMap(parent, child, { inheritAll: true });
    expect(result.output.get('A')).toBe('child-a');
    expect(result.output.get('B')).toBe('2');
    expect(result.output.get('C')).toBe('3');
    expect(result.inherited.size).toBe(2);
    expect(result.skipped.size).toBe(1);
  });

  it('inherits only specified keys', () => {
    const parent = makeMap({ A: '1', B: '2', C: '3' });
    const child = makeMap({});
    const result = inheritEnvMap(parent, child, { keys: ['A', 'C'] });
    expect(result.output.get('A')).toBe('1');
    expect(result.output.has('B')).toBe(false);
    expect(result.output.get('C')).toBe('3');
    expect(result.inherited.size).toBe(2);
  });

  it('child values take precedence over parent', () => {
    const parent = makeMap({ X: 'parent-x' });
    const child = makeMap({ X: 'child-x' });
    const result = inheritEnvMap(parent, child, { keys: ['X'] });
    expect(result.output.get('X')).toBe('child-x');
    expect(result.skipped.get('X')).toBe('parent-x');
    expect(result.inherited.size).toBe(0);
  });

  it('strips prefix from parent keys before inheriting', () => {
    const parent = makeMap({ 'PROD_HOST': 'prod.example.com', 'PROD_PORT': '443' });
    const child = makeMap({});
    const result = inheritEnvMap(parent, child, { inheritAll: true, stripPrefix: 'PROD_' });
    expect(result.output.get('HOST')).toBe('prod.example.com');
    expect(result.output.get('PORT')).toBe('443');
    expect(result.output.has('PROD_HOST')).toBe(false);
  });

  it('returns empty inherited when no keys match', () => {
    const parent = makeMap({ A: '1' });
    const child = makeMap({ B: '2' });
    const result = inheritEnvMap(parent, child, { keys: ['Z'] });
    expect(result.inherited.size).toBe(0);
    expect(result.output.get('B')).toBe('2');
  });

  it('does not mutate original child map', () => {
    const parent = makeMap({ A: '1' });
    const child = makeMap({ B: '2' });
    inheritEnvMap(parent, child, { inheritAll: true });
    expect(child.has('A')).toBe(false);
  });
});

describe('formatInheritReport', () => {
  it('formats report with inherited and skipped keys', () => {
    const parent = makeMap({ A: '1', B: '2' });
    const child = makeMap({ A: 'override' });
    const result = inheritEnvMap(parent, child, { inheritAll: true });
    const report = formatInheritReport(result);
    expect(report).toContain('Inherited : 1');
    expect(report).toContain('Skipped   : 1');
    expect(report).toContain('B');
    expect(report).toContain('A');
  });
});
