import { OmitOptions, OmitResult } from './types';

/**
 * Determines if a key should be omitted based on the provided options.
 */
export function shouldOmit(
  key: string,
  options: OmitOptions
): boolean {
  const { keys, prefixMatch = false, caseInsensitive = false } = options;

  const normalizedKey = caseInsensitive ? key.toLowerCase() : key;
  const normalizedPatterns = keys.map(k =>
    caseInsensitive ? k.toLowerCase() : k
  );

  if (prefixMatch) {
    return normalizedPatterns.some(pattern => normalizedKey.startsWith(pattern));
  }

  return normalizedPatterns.includes(normalizedKey);
}

/**
 * Omits specified keys from an env map.
 */
export function omitEnvKeys(
  envMap: Map<string, string>,
  options: OmitOptions
): OmitResult {
  const result = new Map<string, string>(envMap);
  const omitted: string[] = [];
  const notFound: string[] = [];

  // Track which explicitly listed keys were found (only relevant in non-prefix mode)
  if (!options.prefixMatch) {
    for (const key of options.keys) {
      const lookupKey = options.caseInsensitive
        ? [...envMap.keys()].find(k => k.toLowerCase() === key.toLowerCase())
        : key;
      if (!lookupKey || !envMap.has(lookupKey)) {
        notFound.push(key);
      }
    }
  }

  for (const key of envMap.keys()) {
    if (shouldOmit(key, options)) {
      result.delete(key);
      omitted.push(key);
    }
  }

  return { result, omitted, notFound };
}

/**
 * Formats a human-readable report of the omit operation.
 */
export function formatOmitReport(omitResult: OmitResult): string {
  const lines: string[] = ['[EnvOmit Report]'];

  if (omitResult.omitted.length === 0) {
    lines.push('  No keys were omitted.');
  } else {
    lines.push(`  Omitted (${omitResult.omitted.length}):`);
    for (const key of omitResult.omitted) {
      lines.push(`    - ${key}`);
    }
  }

  if (omitResult.notFound.length > 0) {
    lines.push(`  Not found (${omitResult.notFound.length}):`);
    for (const key of omitResult.notFound) {
      lines.push(`    ? ${key}`);
    }
  }

  return lines.join('\n');
}
