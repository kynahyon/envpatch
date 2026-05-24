import { MergeStrategyOptions, MergeStrategyResult, MergeStrategyName } from "./types";

export function applyMergeStrategy(
  base: Map<string, string>,
  incoming: Map<string, string>,
  options: MergeStrategyOptions
): MergeStrategyResult {
  const { strategy, preferBaseKeys = [], preferIncomingKeys = [] } = options;
  const merged = new Map<string, string>();
  const resolved: string[] = [];
  const baseOnly: string[] = [];
  const incomingOnly: string[] = [];
  const identical: string[] = [];

  const allKeys = new Set([...base.keys(), ...incoming.keys()]);

  for (const key of allKeys) {
    const inBase = base.has(key);
    const inIncoming = incoming.has(key);

    if (inBase && !inIncoming) {
      if (strategy === "intersection") continue;
      merged.set(key, base.get(key)!);
      baseOnly.push(key);
      continue;
    }

    if (!inBase && inIncoming) {
      if (strategy === "intersection") continue;
      merged.set(key, incoming.get(key)!);
      incomingOnly.push(key);
      continue;
    }

    const baseVal = base.get(key)!;
    const incomingVal = incoming.get(key)!;

    if (baseVal === incomingVal) {
      merged.set(key, baseVal);
      identical.push(key);
      continue;
    }

    // Conflict resolution
    resolved.push(key);

    if (preferBaseKeys.includes(key)) {
      merged.set(key, baseVal);
    } else if (preferIncomingKeys.includes(key)) {
      merged.set(key, incomingVal);
    } else if (strategy === "ours") {
      merged.set(key, baseVal);
    } else if (strategy === "theirs") {
      merged.set(key, incomingVal);
    } else {
      // union and intersection both need a winner — default to incoming
      merged.set(key, incomingVal);
    }
  }

  return { merged, resolved, baseOnly, incomingOnly, identical, strategy };
}

export function formatMergeStrategyReport(
  result: MergeStrategyResult
): string {
  const lines: string[] = [
    `Merge Strategy: ${result.strategy}`,
    `Total keys: ${result.merged.size}`,
    `Identical: ${result.identical.length}`,
    `Base only: ${result.baseOnly.length}`,
    `Incoming only: ${result.incomingOnly.length}`,
    `Conflicts resolved: ${result.resolved.length}`,
  ];

  if (result.resolved.length > 0) {
    lines.push("", "Resolved conflicts:");
    for (const key of result.resolved) {
      lines.push(`  - ${key} => ${result.merged.get(key)}`);
    }
  }

  return lines.join("\n");
}
