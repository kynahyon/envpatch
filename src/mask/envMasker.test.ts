import { describe, it, expect } from 'vitest';
import { isSensitiveKey, maskValue, maskEnvMap, formatMaskReport } from './envMasker';
import type { EnvMap, EnvEntry } from '../parser/types';

function makeMap(pairs: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(pairs)) {
    const entry: EnvEntry = { key, value, comment: undefined, raw: `${key}=${value}` };
    map.set(key, entry);
  }
  return map;
}

describe('isSensitiveKey', () => {
  it('detects PASSWORD', () => expect(isSensitiveKey('DB_PASSWORD')).toBe(true));
  it('detects TOKEN', () => expect(isSensitiveKey('ACCESS_TOKEN')).toBe(true));
  it('detects SECRET', () => expect(isSensitiveKey('APP_SECRET')).toBe(true));
  it('does not flag safe keys', () => expect(isSensitiveKey('APP_NAME')).toBe(false));
  it('detects custom pattern', () => {
    expect(isSensitiveKey('MY_PRIVATE_STUFF', ['PRIVATE_STUFF'])).toBe(true);
  });
});

describe('maskValue', () => {
  it('fully masks a value', () => {
    expect(maskValue('supersecret')).toBe('********');
  });
  it('shows first N chars', () => {
    expect(maskValue('supersecret', 3)).toBe('sup********');
  });
  it('handles empty string', () => {
    expect(maskValue('')).toBe('');
  });
  it('masks short values', () => {
    expect(maskValue('abc')).toBe('***');
  });
});

describe('maskEnvMap', () => {
  it('masks sensitive keys and leaves others unchanged', () => {
    const map = makeMap({ DB_PASSWORD: 'secret123', APP_NAME: 'myapp', API_KEY: 'key-abc' });
    const { map: masked, report } = maskEnvMap(map);
    expect(masked.get('APP_NAME')?.value).toBe('myapp');
    expect(masked.get('DB_PASSWORD')?.value).not.toBe('secret123');
    expect(masked.get('API_KEY')?.value).not.toBe('key-abc');
    expect(report.maskedCount).toBe(2);
    expect(report.totalKeys).toBe(3);
  });

  it('respects showFirst option', () => {
    const map = makeMap({ SECRET_KEY: 'abcdefgh' });
    const { map: masked } = maskEnvMap(map, { showFirst: 2 });
    expect(masked.get('SECRET_KEY')?.value).toMatch(/^ab/);
  });

  it('returns empty masked list when no sensitive keys', () => {
    const map = makeMap({ HOST: 'localhost', PORT: '5432' });
    const { report } = maskEnvMap(map);
    expect(report.maskedCount).toBe(0);
  });
});

describe('formatMaskReport', () => {
  it('formats report with masked keys', () => {
    const map = makeMap({ DB_PASSWORD: 'secret' });
    const { report } = maskEnvMap(map);
    const output = formatMaskReport(report);
    expect(output).toContain('1 of 1');
    expect(output).toContain('[MASKED]');
    expect(output).toContain('DB_PASSWORD');
  });

  it('formats report with no masked keys', () => {
    const map = makeMap({ HOST: 'localhost' });
    const { report } = maskEnvMap(map);
    const output = formatMaskReport(report);
    expect(output).toContain('No sensitive keys detected');
  });
});
