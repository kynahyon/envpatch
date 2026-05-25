import { describe, it, expect } from 'vitest';
import { typecheckEnvMap, formatTypecheckReport } from './envTypeChecker';
import { EnvEntry } from '../parser/types';

function makeMap(pairs: Record<string, string>): Map<string, EnvEntry> {
  return new Map(
    Object.entries(pairs).map(([key, value]) => [key, { key, value, comment: undefined, raw: `${key}=${value}` }])
  );
}

describe('typecheckEnvMap', () => {
  it('passes valid boolean', () => {
    const map = makeMap({ FEATURE_FLAG: 'true' });
    const report = typecheckEnvMap(map, [{ key: 'FEATURE_FLAG', expectedType: 'boolean' }]);
    expect(report.passCount).toBe(1);
    expect(report.failCount).toBe(0);
  });

  it('fails invalid boolean', () => {
    const map = makeMap({ FEATURE_FLAG: 'yes' });
    const report = typecheckEnvMap(map, [{ key: 'FEATURE_FLAG', expectedType: 'boolean' }]);
    expect(report.failCount).toBe(1);
    expect(report.results[0].reason).toContain("Expected 'true' or 'false'");
  });

  it('passes valid number', () => {
    const map = makeMap({ TIMEOUT: '3.14' });
    const report = typecheckEnvMap(map, [{ key: 'TIMEOUT', expectedType: 'number' }]);
    expect(report.passCount).toBe(1);
  });

  it('fails invalid integer', () => {
    const map = makeMap({ PORT: '8080.5' });
    const report = typecheckEnvMap(map, [{ key: 'PORT', expectedType: 'integer' }]);
    expect(report.failCount).toBe(1);
  });

  it('passes valid URL', () => {
    const map = makeMap({ API_URL: 'https://example.com/api' });
    const report = typecheckEnvMap(map, [{ key: 'API_URL', expectedType: 'url' }]);
    expect(report.passCount).toBe(1);
  });

  it('fails invalid email', () => {
    const map = makeMap({ ADMIN_EMAIL: 'not-an-email' });
    const report = typecheckEnvMap(map, [{ key: 'ADMIN_EMAIL', expectedType: 'email' }]);
    expect(report.failCount).toBe(1);
  });

  it('skips optional missing key', () => {
    const map = makeMap({});
    const report = typecheckEnvMap(map, [{ key: 'OPTIONAL_KEY', expectedType: 'string', optional: true }]);
    expect(report.skippedCount).toBe(1);
    expect(report.failCount).toBe(0);
  });

  it('fails missing required key', () => {
    const map = makeMap({});
    const report = typecheckEnvMap(map, [{ key: 'REQUIRED_KEY', expectedType: 'string' }]);
    expect(report.failCount).toBe(1);
    expect(report.results[0].reason).toContain('missing');
  });

  it('accepts any string value for type string', () => {
    const map = makeMap({ NAME: 'hello world 123' });
    const report = typecheckEnvMap(map, [{ key: 'NAME', expectedType: 'string' }]);
    expect(report.passCount).toBe(1);
  });
});

describe('formatTypecheckReport', () => {
  it('includes summary line', () => {
    const map = makeMap({ PORT: '3000', FLAG: 'maybe' });
    const report = typecheckEnvMap(map, [
      { key: 'PORT', expectedType: 'integer' },
      { key: 'FLAG', expectedType: 'boolean' },
    ]);
    const output = formatTypecheckReport(report);
    expect(output).toContain('1 passed');
    expect(output).toContain('1 failed');
    expect(output).toContain('✓ PORT');
    expect(output).toContain('✗ FLAG');
  });
});
