import { describe, it, expect } from 'vitest';
import { EnvMap } from '../parser/types';
import { isSensitiveKey, maskValue, maskEnvMap, formatMaskReport } from './envMasker';

function makeMap(entries: Record<string, string>): EnvMap {
  const map: EnvMap = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, { value, comment: undefined, raw: `${key}=${value}` });
  }
  return map;
}

describe('isSensitiveKey', () => {
  it('detects common sensitive key names', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('API_SECRET')).toBe(true);
    expect(isSensitiveKey('AUTH_TOKEN')).toBe(true);
    expect(isSensitiveKey('PRIVATE_KEY')).toBe(true);
  });

  it('returns false for non-sensitive keys', () => {
    expect(isSensitiveKey('APP_NAME')).toBe(false);
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
  });
});

describe('maskValue', () => {
  it('fully masks value by default', () => {
    expect(maskValue('supersecret')).toBe('********');
  });

  it('keeps trailing visible chars when specified', () => {
    const result = maskValue('supersecret', 3);
    expect(result.endsWith('ret')).toBe(true);
    expect(result.startsWith('***')).toBe(true);
  });

  it('returns empty string unchanged', () => {
    expect(maskValue('')).toBe('');
  });
});

describe('maskEnvMap', () => {
  it('masks sensitive keys and leaves others unchanged', () => {
    const map = makeMap({ DB_PASSWORD: 'secret123', APP_NAME: 'myapp', API_KEY: 'key-abc' });
    const { maskedMap, maskedKeys } = maskEnvMap(map);

    expect(maskedKeys).toContain('DB_PASSWORD');
    expect(maskedKeys).toContain('API_KEY');
    expect(maskedKeys).not.toContain('APP_NAME');
    expect(maskedMap.get('APP_NAME')?.value).toBe('myapp');
    expect(maskedMap.get('DB_PASSWORD')?.masked).toBe(true);
    expect(maskedMap.get('APP_NAME')?.masked).toBe(false);
  });

  it('respects additionalKeys option', () => {
    const map = makeMap({ CUSTOM_FIELD: 'sensitive', APP_NAME: 'myapp' });
    const { maskedKeys } = maskEnvMap(map, { additionalKeys: ['CUSTOM_FIELD'] });
    expect(maskedKeys).toContain('CUSTOM_FIELD');
  });
});

describe('formatMaskReport', () => {
  it('reports no sensitive keys when none found', () => {
    const map = makeMap({ APP_NAME: 'myapp' });
    const result = maskEnvMap(map);
    expect(formatMaskReport(result)).toContain('No sensitive keys');
  });

  it('lists masked keys in report', () => {
    const map = makeMap({ DB_PASSWORD: 'secret', APP_NAME: 'myapp' });
    const result = maskEnvMap(map);
    const report = formatMaskReport(result);
    expect(report).toContain('DB_PASSWORD');
    expect(report).toContain('1 key(s) masked');
  });
});
