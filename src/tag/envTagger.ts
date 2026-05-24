import { EnvTag, TaggedEnvMap, TagFilterOptions, TagReport } from './types';

/**
 * Attach tags to keys in an env map, returning a TaggedEnvMap.
 */
export function tagEnvMap(
  entries: Map<string, string>,
  tagRules: EnvTag[]
): TaggedEnvMap {
  const tags = new Map<string, string[]>();

  for (const [key] of entries) {
    tags.set(key, []);
  }

  for (const rule of tagRules) {
    if (!entries.has(rule.key)) continue;
    const existing = tags.get(rule.key) ?? [];
    const merged = Array.from(new Set([...existing, ...rule.tags]));
    tags.set(rule.key, merged);
  }

  return { entries, tags };
}

/**
 * Filter a TaggedEnvMap to only keys that have the specified tags.
 */
export function filterByTags(
  tagged: TaggedEnvMap,
  requiredTags: string[],
  options: TagFilterOptions = {}
): Map<string, string> {
  const { matchAll = false } = options;
  const result = new Map<string, string>();

  for (const [key, value] of tagged.entries) {
    const keyTags = tagged.tags.get(key) ?? [];
    const matches = matchAll
      ? requiredTags.every((t) => keyTags.includes(t))
      : requiredTags.some((t) => keyTags.includes(t));
    if (matches) {
      result.set(key, value);
    }
  }

  return result;
}

/**
 * Build a human-readable tag report.
 */
export function formatTagReport(tagged: TaggedEnvMap): string {
  const report = buildTagReport(tagged);
  const lines: string[] = [
    `Tag Report: ${report.totalKeys} keys, ${report.totalTags} unique tags`,
    '',
  ];

  if (report.tagged.length > 0) {
    lines.push('Tagged keys:');
    for (const entry of report.tagged) {
      lines.push(`  ${entry.key}: [${entry.tags.join(', ')}]`);
    }
  }

  if (report.untagged.length > 0) {
    lines.push('');
    lines.push('Untagged keys:');
    for (const key of report.untagged) {
      lines.push(`  ${key}`);
    }
  }

  return lines.join('\n');
}

export function buildTagReport(tagged: TaggedEnvMap): TagReport {
  const taggedEntries: EnvTag[] = [];
  const untagged: string[] = [];
  const allTags = new Set<string>();

  for (const [key, tags] of tagged.tags) {
    if (tags.length > 0) {
      taggedEntries.push({ key, tags });
      tags.forEach((t) => allTags.add(t));
    } else {
      untagged.push(key);
    }
  }

  return {
    tagged: taggedEntries,
    untagged,
    totalKeys: tagged.entries.size,
    totalTags: allTags.size,
  };
}
