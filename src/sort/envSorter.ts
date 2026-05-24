import { EnvMap } from "../parser/types";

export type SortOrder = "asc" | "desc";

export interface SortOptions {
  order?: SortOrder;
  groupByPrefix?: boolean;
  prefixDelimiter?: string;
}

export interface SortResult {
  original: EnvMap;
  sorted: EnvMap;
  order: SortOrder;
  groupedByPrefix: boolean;
  keyCount: number;
}

export function sortEnvMap(env: EnvMap, options: SortOptions = {}): SortResult {
  const { order = "asc", groupByPrefix = false, prefixDelimiter = "_" } = options;

  const entries = Array.from(env.entries());

  let sortedEntries: [string, string][];

  if (groupByPrefix) {
    const groups = new Map<string, [string, string][]>();
    for (const [key, value] of entries) {
      const prefix = key.includes(prefixDelimiter)
        ? key.split(prefixDelimiter)[0]
        : "";
      if (!groups.has(prefix)) groups.set(prefix, []);
      groups.get(prefix)!.push([key, value]);
    }

    const sortedGroupKeys = Array.from(groups.keys()).sort((a, b) =>
      order === "asc" ? a.localeCompare(b) : b.localeCompare(a)
    );

    sortedEntries = sortedGroupKeys.flatMap((prefix) => {
      const group = groups.get(prefix)!;
      return group.sort(([a], [b]) =>
        order === "asc" ? a.localeCompare(b) : b.localeCompare(a)
      );
    });
  } else {
    sortedEntries = entries.sort(([a], [b]) =>
      order === "asc" ? a.localeCompare(b) : b.localeCompare(a)
    );
  }

  const sorted: EnvMap = new Map(sortedEntries);

  return {
    original: env,
    sorted,
    order,
    groupedByPrefix: groupByPrefix,
    keyCount: sorted.size,
  };
}

export function formatSortReport(result: SortResult): string {
  const lines: string[] = [
    `Sort Report`,
    `===========`,
    `Order: ${result.order}`,
    `Grouped by prefix: ${result.groupedByPrefix}`,
    `Keys sorted: ${result.keyCount}`,
    ``,
    `Sorted keys:`,
  ];
  for (const key of result.sorted.keys()) {
    lines.push(`  ${key}`);
  }
  return lines.join("\n");
}
