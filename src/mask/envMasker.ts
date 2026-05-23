import { EnvMap } from '../parser/types';
import { MaskOptions, MaskResult, MaskedEnvMap } from './types';

const DEFAULT_SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /passwd/i,
];

export function isSensitiveKey(
  key: string,
  patterns: RegExp[] = DEFAULT_SENSITIVE_PATTERNS
): boolean {
  return patterns.some((pattern) => pattern.test(key));
}

export function maskValue(
  value: string,
  visibleChars: number = 0,
  maskChar: string = '*'
): string {
  if (value.length === 0) return value;
  if (visibleChars <= 0) return maskChar.repeat(Math.min(value.length, 8));
  const visible = value.slice(-visibleChars);
  const masked = maskChar.repeat(Math.max(value.length - visibleChars, 3));
  return masked + visible;
}

export function maskEnvMap(
  envMap: EnvMap,
  options: MaskOptions = {}
): MaskResult {
  const {
    patterns = DEFAULT_SENSITIVE_PATTERNS,
    visibleChars = 0,
    maskChar = '*',
    additionalKeys = [],
  } = options;

  const maskedMap: MaskedEnvMap = new Map();
  const maskedKeys: string[] = [];

  for (const [key, entry] of envMap.entries()) {
    const sensitive =
      isSensitiveKey(key, patterns) || additionalKeys.includes(key);

    if (sensitive) {
      maskedMap.set(key, {
        ...entry,
        value: maskValue(entry.value, visibleChars, maskChar),
        masked: true,
      });
      maskedKeys.push(key);
    } else {
      maskedMap.set(key, { ...entry, masked: false });
    }
  }

  return { maskedMap, maskedKeys };
}

export function formatMaskReport(result: MaskResult): string {
  const { maskedKeys } = result;
  if (maskedKeys.length === 0) {
    return 'Mask report: No sensitive keys detected.';
  }
  const lines = [`Mask report: ${maskedKeys.length} key(s) masked.`];
  for (const key of maskedKeys) {
    lines.push(`  - ${key}`);
  }
  return lines.join('\n');
}
