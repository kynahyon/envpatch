import { EnvMap } from '../parser/types';
import { FilterOptions, FilterResult } from './types';

/**
 * Filters an EnvMap by key prefix, suffix, pattern, or explicit key list.
 */
export function filterEnvMap(
  envMap: EnvMap,
  options: FilterOptions
): FilterResult {
  const { prefix, suffix, pattern, keys, exclude = false } = options;
  const matched: EnvMap = new Map();
  const excluded: EnvMap = new Map();

  for (const [key, entry] of envMap.entries()) {
    let matches = false;

    if (keys && keys.length > 0) {
      matches = keys.includes(key);
    } else if (pattern) {
      const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
      matches = regex.test(key);
    } else {
      const prefixMatch = prefix ? key.startsWith(prefix) : true;
      const suffixMatch = suffix ? key.endsWith(suffix) : true;
      matches = prefixMatch && suffixMatch;
    }

    const include = exclude ? !matches : matches;
    if (include) {
      matched.set(key, entry);
    } else {
      excluded.set(key, entry);
    }
  }

  return { matched, excluded };
}

/**
 * Formats a human-readable report of the filter operation.
 */
export function formatFilterReport(result: FilterResult): string {
  const lines: string[] = [];
  lines.push(`Filter Report`);
  lines.push(`  Matched  : ${result.matched.size} key(s)`);
  lines.push(`  Excluded : ${result.excluded.size} key(s)`);

  if (result.matched.size > 0) {
    lines.push(`  Matched keys:`);
    for (const key of result.matched.keys()) {
      lines.push(`    + ${key}`);
    }
  }

  return lines.join('\n');
}
