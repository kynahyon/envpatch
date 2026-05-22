import { EnvMap } from '../parser/types';
import { detectConflicts } from '../conflict/conflictDetector';
import { ConflictResolutionStrategy, MergeResult } from './types';

/**
 * Merges two EnvMaps into one, applying the given conflict resolution strategy.
 *
 * @param base    - The base environment map (lower priority).
 * @param patch   - The patch environment map (higher priority by default).
 * @param strategy - How to resolve key conflicts.
 * @returns A MergeResult containing the merged map and any conflict info.
 */
export function mergeEnvMaps(
  base: EnvMap,
  patch: EnvMap,
  strategy: ConflictResolutionStrategy = 'patch-wins'
): MergeResult {
  const conflicts = detectConflicts(base, patch);
  const merged: EnvMap = new Map(base);
  const appliedKeys: string[] = [];
  const skippedKeys: string[] = [];

  for (const [key, patchEntry] of patch.entries()) {
    const baseEntry = base.get(key);

    if (!baseEntry) {
      // New key — always add it.
      merged.set(key, patchEntry);
      appliedKeys.push(key);
      continue;
    }

    // Conflicting key — apply strategy.
    if (strategy === 'patch-wins') {
      merged.set(key, patchEntry);
      appliedKeys.push(key);
    } else if (strategy === 'base-wins') {
      // Keep base value; do nothing.
      skippedKeys.push(key);
    } else if (strategy === 'error') {
      if (conflicts.length > 0) {
        throw new Error(
          `Merge aborted: ${conflicts.length} conflict(s) detected. ` +
          `First conflict: key "${conflicts[0].key}".`
        );
      }
      merged.set(key, patchEntry);
      appliedKeys.push(key);
    }
  }

  return {
    merged,
    conflicts,
    appliedKeys,
    skippedKeys,
  };
}
