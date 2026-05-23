import type { EnvMap } from '../parser/types';
import type { MaskOptions, MaskEntry, MaskReport, MaskResult } from './types';

const DEFAULT_SENSITIVE_PATTERNS = [
  'SECRET',
  'PASSWORD',
  'PASSWD',
  'TOKEN',
  'API_KEY',
  'APIKEY',
  'PRIVATE',
  'CREDENTIAL',
  'AUTH',
  'ACCESS_KEY',
  'SIGNING',
];

const MASK_CHAR = '*';

export function isSensitiveKey(
  key: string,
  customPatterns: string[] = []
): boolean {
  const upper = key.toUpperCase();
  const patterns = [...DEFAULT_SENSITIVE_PATTERNS, ...customPatterns.map((p) => p.toUpperCase())];
  return patterns.some((pattern) => upper.includes(pattern));
}

export function maskValue(value: string, showFirst = 0): string {
  if (value.length === 0) return value;
  if (showFirst <= 0) return MASK_CHAR.repeat(Math.min(value.length, 8));
  const visible = value.slice(0, showFirst);
  const hidden = MASK_CHAR.repeat(Math.min(value.length - showFirst, 8));
  return visible + hidden;
}

export function maskEnvMap(map: EnvMap, options: MaskOptions = {}): MaskResult {
  const { showFirst = 0, customPatterns = [] } = options;
  const maskedMap: EnvMap = new Map();
  const maskedKeys: MaskEntry[] = [];

  for (const [key, entry] of map.entries()) {
    if (isSensitiveKey(key, customPatterns)) {
      const masked = maskValue(entry.value, showFirst);
      maskedKeys.push({ key, original: entry.value, masked });
      maskedMap.set(key, { ...entry, value: masked });
    } else {
      maskedMap.set(key, entry);
    }
  }

  const report: MaskReport = {
    maskedKeys,
    totalKeys: map.size,
    maskedCount: maskedKeys.length,
  };

  return { map: maskedMap, report };
}

export function formatMaskReport(report: MaskReport): string {
  const lines: string[] = [
    `Mask Report: ${report.maskedCount} of ${report.totalKeys} key(s) masked.`,
  ];
  if (report.maskedKeys.length === 0) {
    lines.push('  No sensitive keys detected.');
  } else {
    for (const entry of report.maskedKeys) {
      lines.push(`  [MASKED] ${entry.key}: ${entry.masked}`);
    }
  }
  return lines.join('\n');
}
