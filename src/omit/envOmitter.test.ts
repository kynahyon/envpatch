import { omitEnvKeys, formatOmitReport, shouldOmit } from './envOmitter';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('shouldOmit', () => {
  it('returns true for exact key match', () => {
    expect(shouldOmit('SECRET', { keys: ['SECRET'] })).toBe(true);
  });

  it('returns false for non-matching key', () => {
    expect(shouldOmit('PUBLIC_URL', { keys: ['SECRET'] })).toBe(false);
  });

  it('supports prefix match', () => {
    expect(shouldOmit('SECRET_KEY', { keys: ['SECRET_'], prefixMatch: true })).toBe(true);
    expect(shouldOmit('PUBLIC_URL', { keys: ['SECRET_'], prefixMatch: true })).toBe(false);
  });

  it('supports case-insensitive match', () => {
    expect(shouldOmit('secret', { keys: ['SECRET'], caseInsensitive: true })).toBe(true);
  });
});

describe('omitEnvKeys', () => {
  it('omits specified keys', () => {
    const map = makeMap({ A: '1', B: '2', C: '3' });
    const { result, omitted, notFound } = omitEnvKeys(map, { keys: ['A', 'C'] });
    expect(result.has('A')).toBe(false);
    expect(result.has('C')).toBe(false);
    expect(result.get('B')).toBe('2');
    expect(omitted).toEqual(expect.arrayContaining(['A', 'C']));
    expect(notFound).toHaveLength(0);
  });

  it('reports keys not found', () => {
    const map = makeMap({ A: '1' });
    const { notFound } = omitEnvKeys(map, { keys: ['A', 'MISSING'] });
    expect(notFound).toContain('MISSING');
  });

  it('omits by prefix', () => {
    const map = makeMap({ SECRET_KEY: 'x', SECRET_TOKEN: 'y', PUBLIC_URL: 'z' });
    const { result, omitted } = omitEnvKeys(map, { keys: ['SECRET_'], prefixMatch: true });
    expect(result.has('SECRET_KEY')).toBe(false);
    expect(result.has('SECRET_TOKEN')).toBe(false);
    expect(result.has('PUBLIC_URL')).toBe(true);
    expect(omitted).toHaveLength(2);
  });

  it('does not mutate the original map', () => {
    const map = makeMap({ A: '1', B: '2' });
    omitEnvKeys(map, { keys: ['A'] });
    expect(map.has('A')).toBe(true);
  });

  it('handles empty keys array', () => {
    const map = makeMap({ A: '1' });
    const { result, omitted } = omitEnvKeys(map, { keys: [] });
    expect(result.size).toBe(1);
    expect(omitted).toHaveLength(0);
  });
});

describe('formatOmitReport', () => {
  it('reports omitted keys', () => {
    const map = makeMap({ A: '1', B: '2' });
    const omitResult = omitEnvKeys(map, { keys: ['A'] });
    const report = formatOmitReport(omitResult);
    expect(report).toContain('[EnvOmit Report]');
    expect(report).toContain('- A');
  });

  it('reports no omissions when nothing removed', () => {
    const map = makeMap({ A: '1' });
    const omitResult = omitEnvKeys(map, { keys: [] });
    const report = formatOmitReport(omitResult);
    expect(report).toContain('No keys were omitted.');
  });

  it('reports not found keys', () => {
    const map = makeMap({ A: '1' });
    const omitResult = omitEnvKeys(map, { keys: ['MISSING'] });
    const report = formatOmitReport(omitResult);
    expect(report).toContain('? MISSING');
  });
});
