import { RedactOptions, RedactResult, RedactReport } from './types';

const DEFAULT_REPLACEMENT = '[REDACTED]';

const DEFAULT_SENSITIVE_PATTERNS: RegExp[] = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /passphrase/i,
];

export function isRedactedKey(key: string, options: RedactOptions): boolean {
  const { keys = [], patterns = DEFAULT_SENSITIVE_PATTERNS } = options;
  if (keys.includes(key)) return true;
  return patterns.some((pattern) => pattern.test(key));
}

export function redactValue(
  value: string,
  replacement: string,
  partialReveal?: number
): string {
  if (partialReveal !== undefined && partialReveal > 0 && value.length > partialReveal) {
    return value.slice(0, partialReveal) + replacement;
  }
  return replacement;
}

export function redactEnvMap(
  envMap: Map<string, string>,
  options: RedactOptions = {}
): RedactResult {
  const replacement = options.replacement ?? DEFAULT_REPLACEMENT;
  const redacted = new Map<string, string>();
  const redactedKeys: string[] = [];

  for (const [key, value] of envMap.entries()) {
    if (isRedactedKey(key, options)) {
      redacted.set(key, redactValue(value, replacement, options.partialReveal));
      redactedKeys.push(key);
    } else {
      redacted.set(key, value);
    }
  }

  return { original: envMap, redacted, redactedKeys };
}

export function formatRedactReport(result: RedactResult, options: RedactOptions = {}): string {
  const replacement = options.replacement ?? DEFAULT_REPLACEMENT;
  const report: RedactReport = {
    totalKeys: result.original.size,
    redactedCount: result.redactedKeys.length,
    redactedKeys: result.redactedKeys,
    replacement,
  };

  const lines: string[] = [
    `Redact Report`,
    `  Total keys   : ${report.totalKeys}`,
    `  Redacted     : ${report.redactedCount}`,
    `  Replacement  : ${report.replacement}`,
  ];

  if (report.redactedKeys.length > 0) {
    lines.push(`  Redacted keys:`);
    for (const key of report.redactedKeys) {
      lines.push(`    - ${key}`);
    }
  }

  return lines.join('\n');
}
