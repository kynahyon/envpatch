import { EnvMap } from '../parser/types';
import { DiffEntry, DiffOptions, EnvDiff } from './types';

/**
 * Computes the diff between two EnvMaps.
 * `base` is the original, `target` is the updated version.
 */
export function diffEnvMaps(
  base: EnvMap,
  target: EnvMap,
  options: DiffOptions = {}
): EnvDiff {
  const { includeUnchanged = false, ignoreKeys = [] } = options;
  const ignoreSet = new Set(ignoreKeys);

  const entries: DiffEntry[] = [];
  const allKeys = new Set([...base.keys(), ...target.keys()]);

  let addedCount = 0;
  let removedCount = 0;
  let changedCount = 0;
  let unchangedCount = 0;

  for (const key of allKeys) {
    if (ignoreSet.has(key)) continue;

    const inBase = base.has(key);
    const inTarget = target.has(key);
    const oldValue = base.get(key);
    const newValue = target.get(key);

    if (!inBase && inTarget) {
      entries.push({ key, operation: 'added', newValue });
      addedCount++;
    } else if (inBase && !inTarget) {
      entries.push({ key, operation: 'removed', oldValue });
      removedCount++;
    } else if (oldValue !== newValue) {
      entries.push({ key, operation: 'changed', oldValue, newValue });
      changedCount++;
    } else {
      unchangedCount++;
      if (includeUnchanged) {
        entries.push({ key, operation: 'unchanged', oldValue, newValue });
      }
    }
  }

  return { entries, addedCount, removedCount, changedCount, unchangedCount };
}

/**
 * Formats an EnvDiff into a human-readable report string.
 */
export function formatDiffReport(diff: EnvDiff): string {
  const lines: string[] = [];

  lines.push(`Diff summary: +${diff.addedCount} added, -${diff.removedCount} removed, ~${diff.changedCount} changed, =${diff.unchangedCount} unchanged`);

  for (const entry of diff.entries) {
    switch (entry.operation) {
      case 'added':
        lines.push(`  + ${entry.key}=${entry.newValue}`);
        break;
      case 'removed':
        lines.push(`  - ${entry.key}=${entry.oldValue}`);
        break;
      case 'changed':
        lines.push(`  ~ ${entry.key}: "${entry.oldValue}" → "${entry.newValue}"`);
        break;
      case 'unchanged':
        lines.push(`  = ${entry.key}=${entry.oldValue}`);
        break;
    }
  }

  return lines.join('\n');
}
