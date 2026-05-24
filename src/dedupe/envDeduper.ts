import { EnvMap } from '../parser/types';

export interface DedupeResult {
  deduped: EnvMap;
  duplicates: Map<string, string[]>;
  removedCount: number;
}

/**
 * Detects and removes duplicate keys across multiple EnvMaps.
 * When duplicates exist, the value from the last map wins (rightmost precedence).
 */
export function dedupeEnvMaps(maps: EnvMap[]): DedupeResult {
  const duplicates = new Map<string, string[]>();
  const keyOrigins = new Map<string, number[]>();

  maps.forEach((map, index) => {
    for (const key of map.keys()) {
      const origins = keyOrigins.get(key) ?? [];
      origins.push(index);
      keyOrigins.set(key, origins);
    }
  });

  for (const [key, origins] of keyOrigins.entries()) {
    if (origins.length > 1) {
      const values = origins.map(i => maps[i].get(key)?.value ?? '');
      duplicates.set(key, values);
    }
  }

  const deduped: EnvMap = new Map();
  for (const map of maps) {
    for (const [key, entry] of map.entries()) {
      deduped.set(key, entry);
    }
  }

  const removedCount = Array.from(keyOrigins.values()).reduce(
    (sum, origins) => sum + Math.max(0, origins.length - 1),
    0
  );

  return { deduped, duplicates, removedCount };
}

export function formatDedupeReport(result: DedupeResult): string {
  const lines: string[] = ['=== Dedupe Report ==='];
  lines.push(`Removed: ${result.removedCount} duplicate(s)`);

  if (result.duplicates.size === 0) {
    lines.push('No duplicates found.');
  } else {
    lines.push('\nDuplicate keys:');
    for (const [key, values] of result.duplicates.entries()) {
      lines.push(`  ${key}: [${values.map(v => JSON.stringify(v)).join(', ')}] → kept last`);
    }
  }

  lines.push(`\nFinal map size: ${result.deduped.size} key(s)`);
  return lines.join('\n');
}
