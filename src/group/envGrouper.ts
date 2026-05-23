import { GroupedEnvMap, GroupOptions, GroupReport } from './types';

/**
 * Groups an EnvMap by key prefix or explicit group definitions.
 */
export function groupEnvMap(
  envMap: Map<string, string>,
  options: GroupOptions = {}
): GroupedEnvMap {
  const { delimiter = '_', explicitGroups = [], includeUngrouped = true } = options;
  const groups: Record<string, Map<string, string>> = {};
  const ungrouped = new Map<string, string>();
  const assignedKeys = new Set<string>();

  // Apply explicit groups first
  for (const group of explicitGroups) {
    groups[group.name] = new Map();
    for (const key of group.keys) {
      if (envMap.has(key)) {
        groups[group.name].set(key, envMap.get(key)!);
        assignedKeys.add(key);
      }
    }
  }

  // Group remaining keys by prefix
  for (const [key, value] of envMap) {
    if (assignedKeys.has(key)) continue;
    const delimIndex = key.indexOf(delimiter);
    if (delimIndex > 0) {
      const prefix = key.slice(0, delimIndex);
      if (!groups[prefix]) {
        groups[prefix] = new Map();
      }
      groups[prefix].set(key, value);
      assignedKeys.add(key);
    } else if (includeUngrouped) {
      ungrouped.set(key, value);
    }
  }

  return { groups, ungrouped };
}

/**
 * Flattens a GroupedEnvMap back into a single EnvMap.
 */
export function flattenGroupedEnvMap(grouped: GroupedEnvMap): Map<string, string> {
  const result = new Map<string, string>();
  for (const groupMap of Object.values(grouped.groups)) {
    for (const [key, value] of groupMap) {
      result.set(key, value);
    }
  }
  for (const [key, value] of grouped.ungrouped) {
    result.set(key, value);
  }
  return result;
}

/**
 * Generates a human-readable report of the grouping result.
 */
export function formatGroupReport(grouped: GroupedEnvMap): string {
  const report = buildGroupReport(grouped);
  const lines: string[] = [
    `Env Group Report`,
    `  Total keys   : ${report.totalKeys}`,
    `  Groups found : ${report.groupCount}`,
    `  Ungrouped    : ${report.ungroupedCount}`,
    '',
  ];
  for (const g of report.groups) {
    lines.push(`  [${g.name}] (${g.keyCount} keys)`);
    for (const key of g.keys) {
      lines.push(`    - ${key}`);
    }
  }
  if (report.ungroupedCount > 0) {
    lines.push(`  [ungrouped] (${report.ungroupedCount} keys)`);
    for (const key of grouped.ungrouped.keys()) {
      lines.push(`    - ${key}`);
    }
  }
  return lines.join('\n');
}

function buildGroupReport(grouped: GroupedEnvMap): GroupReport {
  const groups = Object.entries(grouped.groups).map(([name, map]) => ({
    name,
    keyCount: map.size,
    keys: Array.from(map.keys()),
  }));
  const totalKeys =
    groups.reduce((sum, g) => sum + g.keyCount, 0) + grouped.ungrouped.size;
  return {
    totalKeys,
    groupCount: groups.length,
    ungroupedCount: grouped.ungrouped.size,
    groups,
  };
}
