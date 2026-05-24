import { EnvMap } from '../parser/types';

export interface TrimOptions {
  trimKeys?: boolean;
  trimValues?: boolean;
  removeEmpty?: boolean;
}

export interface TrimResult {
  original: EnvMap;
  trimmed: EnvMap;
  removedKeys: string[];
  modifiedKeys: string[];
}

export function trimEnvMap(
  env: EnvMap,
  options: TrimOptions = {}
): TrimResult {
  const {
    trimKeys = false,
    trimValues = true,
    removeEmpty = false,
  } = options;

  const trimmed: EnvMap = new Map();
  const removedKeys: string[] = [];
  const modifiedKeys: string[] = [];

  for (const [key, entry] of env.entries()) {
    const newKey = trimKeys ? key.trim() : key;
    const newValue = trimValues ? entry.value.trim() : entry.value;

    if (removeEmpty && newValue === '') {
      removedKeys.push(key);
      continue;
    }

    if (newKey !== key || newValue !== entry.value) {
      modifiedKeys.push(key);
    }

    trimmed.set(newKey, { ...entry, value: newValue });
  }

  return { original: env, trimmed, removedKeys, modifiedKeys };
}

export function formatTrimReport(result: TrimResult): string {
  const lines: string[] = ['=== Trim Report ==='];

  if (result.modifiedKeys.length === 0 && result.removedKeys.length === 0) {
    lines.push('No changes made.');
    return lines.join('\n');
  }

  if (result.modifiedKeys.length > 0) {
    lines.push(`Modified (${result.modifiedKeys.length}):`);
    for (const key of result.modifiedKeys) {
      const orig = result.original.get(key)?.value ?? '';
      const trimmed = result.trimmed.get(key)?.value ?? '';
      lines.push(`  ${key}: "${orig}" -> "${trimmed}"`);
    }
  }

  if (result.removedKeys.length > 0) {
    lines.push(`Removed empty (${result.removedKeys.length}):`);
    for (const key of result.removedKeys) {
      lines.push(`  ${key}`);
    }
  }

  return lines.join('\n');
}
