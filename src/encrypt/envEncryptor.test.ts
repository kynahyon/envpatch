import { encryptEnvMap, decryptEnvMap, encryptValue, decryptValue, formatEncryptReport } from './envEncryptor';

const SECRET = 'test-secret-key-for-unit-tests';

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe('encryptValue / decryptValue', () => {
  it('round-trips a plain value', () => {
    const encrypted = encryptValue('mysecret', SECRET);
    expect(encrypted.startsWith('enc:')).toBe(true);
    expect(decryptValue(encrypted, SECRET)).toBe('mysecret');
  });

  it('throws when decrypting non-encrypted value', () => {
    expect(() => decryptValue('plaintext', SECRET)).toThrow();
  });
});

describe('encryptEnvMap', () => {
  it('encrypts keys matching default pattern', () => {
    const map = makeMap({ DB_PASSWORD: 'hunter2', APP_NAME: 'envpatch' });
    const result = encryptEnvMap(map, SECRET);
    expect(result.encryptedCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(result.encryptedMap.get('DB_PASSWORD')!.startsWith('enc:')).toBe(true);
    expect(result.encryptedMap.get('APP_NAME')).toBe('envpatch');
  });

  it('encrypts keys listed in sensitiveKeys option', () => {
    const map = makeMap({ CUSTOM_FIELD: 'value', OTHER: 'data' });
    const result = encryptEnvMap(map, SECRET, { sensitiveKeys: ['CUSTOM_FIELD'] });
    expect(result.encryptedCount).toBe(1);
    expect(result.encryptedMap.get('CUSTOM_FIELD')!.startsWith('enc:')).toBe(true);
  });

  it('skips already-encrypted values', () => {
    const alreadyEncrypted = encryptValue('original', SECRET);
    const map = makeMap({ DB_TOKEN: alreadyEncrypted });
    const result = encryptEnvMap(map, SECRET);
    expect(result.encryptedCount).toBe(0);
    expect(result.encryptedMap.get('DB_TOKEN')).toBe(alreadyEncrypted);
  });
});

describe('decryptEnvMap', () => {
  it('decrypts all encrypted values', () => {
    const map = makeMap({ DB_PASSWORD: 'secret123', APP_NAME: 'envpatch' });
    const encrypted = encryptEnvMap(map, SECRET);
    const result = decryptEnvMap(encrypted.encryptedMap, SECRET);
    expect(result.decryptedCount).toBe(1);
    expect(result.failedKeys).toHaveLength(0);
    expect(result.decryptedMap.get('DB_PASSWORD')).toBe('secret123');
    expect(result.decryptedMap.get('APP_NAME')).toBe('envpatch');
  });

  it('records failed keys on wrong secret', () => {
    const encrypted = encryptValue('value', SECRET);
    const map = makeMap({ API_KEY: encrypted });
    const result = decryptEnvMap(map, 'wrong-secret');
    expect(result.failedKeys).toContain('API_KEY');
  });
});

describe('formatEncryptReport', () => {
  it('includes encrypted key names and counts', () => {
    const map = makeMap({ DB_PASSWORD: 'pw', HOST: 'localhost' });
    const result = encryptEnvMap(map, SECRET);
    const report = formatEncryptReport(result);
    expect(report).toContain('Encrypted : 1');
    expect(report).toContain('Skipped   : 1');
    expect(report).toContain('[ENC] DB_PASSWORD');
  });
});
