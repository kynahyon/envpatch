import { promoteEnvMap, formatPromoteReport } from './envPromoter';

const makeMap = (obj: Record<string, string>) => new Map(Object.entries(obj));

describe('promoteEnvMap', () => {
  it('promotes all source keys to empty target', () => {
    const source = makeMap({ API_URL: 'https://prod.example.com', DEBUG: 'false' });
    const target = makeMap({});
    const result = promoteEnvMap(source, target);
    expect(result.promoted.size).toBe(2);
    expect(result.skipped.size).toBe(0);
    expect(target.get('API_URL')).toBe('https://prod.example.com');
    expect(target.get('DEBUG')).toBe('false');
  });

  it('skips existing keys when overwrite is false', () => {
    const source = makeMap({ API_URL: 'https://prod.example.com', DEBUG: 'false' });
    const target = makeMap({ API_URL: 'https://staging.example.com' });
    const result = promoteEnvMap(source, target, { overwrite: false });
    expect(result.skipped.has('API_URL')).toBe(true);
    expect(target.get('API_URL')).toBe('https://staging.example.com');
  });

  it('overwrites existing keys when overwrite is true', () => {
    const source = makeMap({ API_URL: 'https://prod.example.com' });
    const target = makeMap({ API_URL: 'https://staging.example.com' });
    const result = promoteEnvMap(source, target, { overwrite: true });
    expect(result.promoted.has('API_URL')).toBe(true);
    expect(target.get('API_URL')).toBe('https://prod.example.com');
  });

  it('does not mutate target in dry run mode', () => {
    const source = makeMap({ NEW_KEY: 'value' });
    const target = makeMap({});
    const result = promoteEnvMap(source, target, { dryRun: true });
    expect(result.dryRun).toBe(true);
    expect(result.promoted.has('NEW_KEY')).toBe(true);
    expect(target.has('NEW_KEY')).toBe(false);
  });

  it('only promotes specified keys', () => {
    const source = makeMap({ A: '1', B: '2', C: '3' });
    const target = makeMap({});
    const result = promoteEnvMap(source, target, { keysToPromote: ['A', 'C'] });
    expect(result.promoted.size).toBe(2);
    expect(target.has('B')).toBe(false);
  });

  it('skips keys not found in source when keysToPromote is set', () => {
    const source = makeMap({ A: '1' });
    const target = makeMap({});
    const result = promoteEnvMap(source, target, { keysToPromote: ['A', 'MISSING'] });
    expect(result.skipped.has('MISSING')).toBe(true);
    expect(result.skipped.get('MISSING')?.reason).toContain('not found in source');
  });
});

describe('formatPromoteReport', () => {
  it('includes promoted and skipped keys', () => {
    const source = makeMap({ A: 'new', B: 'val' });
    const target = makeMap({ B: 'old' });
    const result = promoteEnvMap(source, target, { overwrite: false });
    const report = formatPromoteReport(result);
    expect(report).toContain('Promoted');
    expect(report).toContain('A="new"');
    expect(report).toContain('Skipped');
    expect(report).toContain('B');
  });

  it('marks dry run in report header', () => {
    const result = promoteEnvMap(makeMap({ X: '1' }), makeMap({}), { dryRun: true });
    const report = formatPromoteReport(result);
    expect(report).toContain('[DRY RUN]');
  });
});
