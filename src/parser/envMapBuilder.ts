import { EnvEntry, EnvMap } from './types';

/**
 * Converts an array of EnvEntry objects into a flat EnvMap (key -> value).
 * Warns if duplicate keys are found within the same source.
 */
export function buildEnvMap(
  entries: EnvEntry[]
): { map: EnvMap; duplicates: string[] } {
  const map: EnvMap = {};
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const entry of entries) {
    if (seen.has(entry.key)) {
      duplicates.push(
        `Duplicate key "${entry.key}" in ${entry.source} at line ${entry.lineNumber}`
      );
    }
    seen.add(entry.key);
    map[entry.key] = entry.value;
  }

  return { map, duplicates };
}

/**
 * Serialises an EnvMap back to .env file content.
 */
export function serializeEnvMap(map: EnvMap): string {
  return Object.entries(map)
    .map(([key, value]) => {
      const needsQuotes = value.includes(' ') || value.includes('#');
      const serialisedValue = needsQuotes ? `"${value}"` : value;
      return `${key}=${serialisedValue}`;
    })
    .join('\n');
}
