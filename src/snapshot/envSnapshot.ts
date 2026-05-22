import { EnvMap } from '../parser/types';
import { SnapshotEntry, EnvSnapshot } from './types';

/**
 * Creates a snapshot of the current EnvMap with a timestamp and optional label.
 */
export function createSnapshot(envMap: EnvMap, label?: string): EnvSnapshot {
  const entries: SnapshotEntry[] = Array.from(envMap.entries()).map(([key, entry]) => ({
    key,
    value: entry.value,
    comment: entry.comment,
  }));

  return {
    label: label ?? `snapshot-${Date.now()}`,
    createdAt: new Date().toISOString(),
    entries,
  };
}

/**
 * Restores an EnvMap from a snapshot.
 */
export function restoreSnapshot(snapshot: EnvSnapshot): EnvMap {
  const map: EnvMap = new Map();
  for (const entry of snapshot.entries) {
    map.set(entry.key, {
      value: entry.value,
      comment: entry.comment,
    });
  }
  return map;
}

/**
 * Formats a snapshot as a human-readable report string.
 */
export function formatSnapshotReport(snapshot: EnvSnapshot): string {
  const lines: string[] = [
    `Snapshot: ${snapshot.label}`,
    `Created:  ${snapshot.createdAt}`,
    `Entries:  ${snapshot.entries.length}`,
    '---',
  ];

  for (const entry of snapshot.entries) {
    const comment = entry.comment ? `  # ${entry.comment}` : '';
    lines.push(`  ${entry.key}=${entry.value}${comment}`);
  }

  return lines.join('\n');
}
