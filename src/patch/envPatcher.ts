import { EnvMap } from '../parser/types';
import { PatchEntry, PatchOptions, PatchResult } from './types';

export function applyPatch(
  target: EnvMap,
  source: EnvMap,
  options: PatchOptions = {}
): PatchResult {
  const { overwrite = true, prune = false, excludeKeys = [], dryRun = false } = options;

  const entries: PatchEntry[] = [];
  const excludeSet = new Set(excludeKeys);

  // Add or update keys from source
  for (const [key, sourceEntry] of source.entries()) {
    if (excludeSet.has(key)) {
      entries.push({ key, operation: 'skip', sourceValue: sourceEntry.value });
      continue;
    }

    const targetEntry = target.get(key);

    if (!targetEntry) {
      entries.push({
        key,
        operation: 'add',
        sourceValue: sourceEntry.value,
        resultValue: sourceEntry.value,
      });
      if (!dryRun) target.set(key, { ...sourceEntry });
    } else if (overwrite && targetEntry.value !== sourceEntry.value) {
      entries.push({
        key,
        operation: 'update',
        sourceValue: sourceEntry.value,
        targetValue: targetEntry.value,
        resultValue: sourceEntry.value,
      });
      if (!dryRun) target.set(key, { ...sourceEntry });
    } else {
      entries.push({
        key,
        operation: 'skip',
        sourceValue: sourceEntry.value,
        targetValue: targetEntry.value,
        resultValue: targetEntry.value,
      });
    }
  }

  // Prune keys not present in source
  if (prune) {
    for (const [key] of target.entries()) {
      if (!source.has(key) && !excludeSet.has(key)) {
        entries.push({ key, operation: 'delete', targetValue: target.get(key)?.value });
        if (!dryRun) target.delete(key);
      }
    }
  }

  return {
    entries,
    addedCount: entries.filter((e) => e.operation === 'add').length,
    updatedCount: entries.filter((e) => e.operation === 'update').length,
    deletedCount: entries.filter((e) => e.operation === 'delete').length,
    skippedCount: entries.filter((e) => e.operation === 'skip').length,
    success: true,
  };
}

export function formatPatchReport(result: PatchResult): string {
  const lines: string[] = [
    `Patch summary: +${result.addedCount} added, ~${result.updatedCount} updated, -${result.deletedCount} deleted, ${result.skippedCount} skipped`,
    '',
  ];

  for (const entry of result.entries) {
    const symbol = { add: '+', update: '~', delete: '-', skip: '=' }[entry.operation];
    const detail =
      entry.operation === 'update'
        ? `${entry.targetValue} → ${entry.resultValue}`
        : entry.resultValue ?? entry.targetValue ?? entry.sourceValue ?? '';
    lines.push(`  [${symbol}] ${entry.key}: ${detail}`);
  }

  return lines.join('\n');
}
