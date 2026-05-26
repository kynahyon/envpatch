import { EnvMap } from '../parser/types';
import { CascadeLayer, CascadeEntry, CascadeResult } from './types';

/**
 * Cascades multiple env maps in priority order.
 * Higher priority layers override lower priority ones.
 */
export function cascadeEnvMaps(
  layers: Array<{ map: EnvMap; layer: CascadeLayer }>
): CascadeResult {
  const sorted = [...layers].sort((a, b) => a.layer.priority - b.layer.priority);

  // key -> all entries from all layers
  const allEntries = new Map<string, CascadeEntry[]>();

  for (const { map, layer } of sorted) {
    for (const [key, entry] of map.entries()) {
      if (!allEntries.has(key)) allEntries.set(key, []);
      allEntries.get(key)!.push({
        key,
        value: entry.value,
        comment: entry.comment,
        source: layer.name,
        layer,
      });
    }
  }

  const resolved = new Map<string, CascadeEntry>();
  const overrides: CascadeResult['overrides'] = [];

  for (const [key, entries] of allEntries.entries()) {
    // highest priority wins
    const sortedEntries = [...entries].sort(
      (a, b) => b.layer.priority - a.layer.priority
    );
    const winner = sortedEntries[0];
    resolved.set(key, winner);

    if (sortedEntries.length > 1) {
      overrides.push({
        key,
        winner,
        losers: sortedEntries.slice(1),
      });
    }
  }

  return {
    resolved,
    overrides,
    layers: sorted.map((l) => l.layer),
  };
}

export function formatCascadeReport(result: CascadeResult): string {
  const lines: string[] = [];
  lines.push(`Cascade resolved ${result.resolved.size} key(s) across ${result.layers.length} layer(s).`);

  if (result.overrides.length === 0) {
    lines.push('No overrides detected.');
  } else {
    lines.push(`Overrides (${result.overrides.length}):`);
    for (const ov of result.overrides) {
      const loserNames = ov.losers.map((l) => l.source).join(', ');
      lines.push(
        `  ${ov.key}: "${ov.winner.value}" (from ${ov.winner.source}) overrides [${loserNames}]`
      );
    }
  }

  return lines.join('\n');
}
