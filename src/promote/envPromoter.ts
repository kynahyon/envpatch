import { EnvMap, PromoteOptions, PromoteResult } from './types';

/**
 * Promotes key-value pairs from a source env map to a target env map.
 * Useful for promoting .env.staging -> .env.production, etc.
 */
export function promoteEnvMap(
  source: EnvMap,
  target: EnvMap,
  options: PromoteOptions = {}
): PromoteResult {
  const { overwrite = false, dryRun = false, keysToPromote } = options;

  const promoted = new Map<string, { from: string; to: string | undefined }>();
  const skipped = new Map<string, { reason: string }>();

  const keys = keysToPromote ?? Array.from(source.keys());

  for (const key of keys) {
    if (!source.has(key)) {
      skipped.set(key, { reason: 'key not found in source' });
      continue;
    }

    const sourceValue = source.get(key)!;
    const targetValue = target.get(key);

    if (targetValue !== undefined && !overwrite) {
      skipped.set(key, { reason: 'key exists in target and overwrite is false' });
      continue;
    }

    promoted.set(key, { from: sourceValue, to: targetValue });

    if (!dryRun) {
      target.set(key, sourceValue);
    }
  }

  return { promoted, skipped, dryRun };
}

export function formatPromoteReport(result: PromoteResult): string {
  const lines: string[] = [];

  lines.push(`Promote Report${result.dryRun ? ' [DRY RUN]' : ''}`);
  lines.push('='.repeat(40));

  if (result.promoted.size === 0) {
    lines.push('No keys promoted.');
  } else {
    lines.push(`Promoted (${result.promoted.size}):`);
    for (const [key, { from, to }] of result.promoted) {
      const prev = to !== undefined ? ` (was: "${to}")` : ' (new)';
      lines.push(`  + ${key}="${from}"${prev}`);
    }
  }

  if (result.skipped.size > 0) {
    lines.push(`Skipped (${result.skipped.size}):`);
    for (const [key, { reason }] of result.skipped) {
      lines.push(`  - ${key}: ${reason}`);
    }
  }

  return lines.join('\n');
}
