import * as crypto from 'crypto';
import { EncryptOptions, EncryptResult, DecryptResult, EncryptedEntry } from './types';

const ENCRYPTED_PREFIX = 'enc:';
const IV_LENGTH = 16;
const DEFAULT_KEY_PATTERN = /secret|password|token|key|auth|pwd|credential/i;

export function encryptValue(value: string, secret: string, algorithm = 'aes-256-cbc'): string {
  const key = crypto.scryptSync(secret, 'envpatch-salt', 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return ENCRYPTED_PREFIX + iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptValue(value: string, secret: string, algorithm = 'aes-256-cbc'): string {
  if (!value.startsWith(ENCRYPTED_PREFIX)) {
    throw new Error(`Value is not encrypted (missing '${ENCRYPTED_PREFIX}' prefix)`);
  }
  const raw = value.slice(ENCRYPTED_PREFIX.length);
  const [ivHex, encryptedHex] = raw.split(':');
  const key = crypto.scryptSync(secret, 'envpatch-salt', 32);
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedBuf = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  return Buffer.concat([decipher.update(encryptedBuf), decipher.final()]).toString('utf8');
}

export function encryptEnvMap(
  envMap: Map<string, string>,
  secret: string,
  options: EncryptOptions = {}
): EncryptResult {
  const { algorithm = 'aes-256-cbc', keyPattern = DEFAULT_KEY_PATTERN, sensitiveKeys = [] } = options;
  const encryptedMap = new Map<string, string>();
  const entries: EncryptedEntry[] = [];
  let encryptedCount = 0;
  let skippedCount = 0;

  for (const [key, value] of envMap) {
    const isSensitive = keyPattern.test(key) || sensitiveKeys.includes(key);
    const alreadyEncrypted = value.startsWith(ENCRYPTED_PREFIX);

    if (isSensitive && !alreadyEncrypted) {
      encryptedMap.set(key, encryptValue(value, secret, algorithm));
      entries.push({ key, encrypted: true, originalLength: value.length });
      encryptedCount++;
    } else {
      encryptedMap.set(key, value);
      entries.push({ key, encrypted: false });
      skippedCount++;
    }
  }

  return { encryptedMap, entries, encryptedCount, skippedCount };
}

export function decryptEnvMap(
  envMap: Map<string, string>,
  secret: string,
  algorithm = 'aes-256-cbc'
): DecryptResult {
  const decryptedMap = new Map<string, string>();
  const failedKeys: string[] = [];
  let decryptedCount = 0;

  for (const [key, value] of envMap) {
    if (value.startsWith(ENCRYPTED_PREFIX)) {
      try {
        decryptedMap.set(key, decryptValue(value, secret, algorithm));
        decryptedCount++;
      } catch {
        decryptedMap.set(key, value);
        failedKeys.push(key);
      }
    } else {
      decryptedMap.set(key, value);
    }
  }

  return { decryptedMap, decryptedCount, failedKeys };
}

export function formatEncryptReport(result: EncryptResult): string {
  const lines: string[] = ['Encrypt Report:', `  Encrypted : ${result.encryptedCount}`, `  Skipped   : ${result.skippedCount}`];
  for (const entry of result.entries) {
    if (entry.encrypted) {
      lines.push(`  [ENC] ${entry.key} (original length: ${entry.originalLength})`);
    }
  }
  return lines.join('\n');
}
