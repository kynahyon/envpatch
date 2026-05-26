import { EnvMap } from '../parser/types';
import { ImmutableOptions, ImmutableResult, ImmutableEntry } from './types';

/**
 * Locks specified keys in an env map, preventing their values from being changed.
 * Returns a new map with the locked entries preserved from the base map.
 */
export function lockEnvKeys(
  base: EnvMap,
  incoming: EnvMap,
  options: ImmutableOptions
): ImmutableResult {
  const { keys, strict = false } = options;
  const result: EnvMap = new Map(incoming);
  const locked: ImmutableEntry[] = [];
  const attempted: string[] = [];
  const blocked: string[] = [];
  const now = new Date().toISOString();

  for (const key of keys) {
    if (!base.has(key)) continue;

    const baseValue = base.get(key)!;
    const incomingValue = incoming.get(key);

    if (incomingValue !== undefined && incomingValue !== baseValue) {
      attempted.push(key);
      blocked.push(key);
      if (strict) {
        throw new Error(
          `[envpatch] Immutable key "${key}" cannot be changed (base: "${baseValue}", incoming: "${incomingValue}").`
        );
      }
    }

    // Always restore base value for locked keys
    result.set(key, baseValue);
    locked.push({ key, value: baseValue, lockedAt: now });
  }

  return { result, locked, attempted, blocked };
}

export function formatImmutableReport(result: ImmutableResult): string {
  const lines: string[] = ['[Immutable Report]'];

  lines.push(`  Locked keys   : ${result.locked.length}`);
  lines.push(`  Attempted edits: ${result.attempted.length}`);
  lines.push(`  Blocked edits  : ${result.blocked.length}`);

  if (result.locked.length > 0) {
    lines.push('  Locked:');
    for (const entry of result.locked) {
      lines.push(`    ${entry.key} = ${entry.value}`);
    }
  }

  if (result.blocked.length > 0) {
    lines.push('  Blocked mutations:');
    for (const key of result.blocked) {
      lines.push(`    ${key}`);
    }
  }

  return lines.join('\n');
}
