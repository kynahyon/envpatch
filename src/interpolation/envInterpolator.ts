import { EnvMap, InterpolationOptions, InterpolationResult } from './types';

const VAR_PATTERN = /\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/g;

function resolveValue(
  key: string,
  map: EnvMap,
  visited: Set<string>,
  cache: Map<string, string>,
  options: InterpolationOptions,
  depth: number
): string | undefined {
  const maxDepth = options.maxDepth ?? 10;
  if (depth > maxDepth) return undefined;
  if (cache.has(key)) return cache.get(key);
  if (visited.has(key)) return undefined; // cycle detected

  const raw = map.get(key);
  if (raw === undefined) return undefined;

  visited.add(key);

  const result = raw.replace(VAR_PATTERN, (_match, braced, unbraced) => {
    const refKey = braced ?? unbraced;
    const resolved = resolveValue(refKey, map, new Set(visited), cache, options, depth + 1);
    if (resolved === undefined) {
      return _match; // leave unresolved
    }
    return resolved;
  });

  visited.delete(key);
  cache.set(key, result);
  return result;
}

function detectCycle(key: string, map: EnvMap, visited: string[] = []): string[] | null {
  if (visited.includes(key)) return [...visited, key];
  const raw = map.get(key);
  if (!raw) return null;
  const refs: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(VAR_PATTERN.source, 'g');
  while ((m = re.exec(raw)) !== null) {
    refs.push(m[1] ?? m[2]);
  }
  for (const ref of refs) {
    const cycle = detectCycle(ref, map, [...visited, key]);
    if (cycle) return cycle;
  }
  return null;
}

export function interpolateEnvMap(
  map: EnvMap,
  options: InterpolationOptions = {}
): InterpolationResult {
  const resolved = new Map<string, string>();
  const unresolved: string[] = [];
  const cycles: string[][] = [];
  const cache = new Map<string, string>();

  // Detect cycles first
  const seenCycles = new Set<string>();
  for (const key of map.keys()) {
    const cycle = detectCycle(key, map);
    if (cycle) {
      const cycleKey = cycle.join('->');
      if (!seenCycles.has(cycleKey)) {
        seenCycles.add(cycleKey);
        cycles.push(cycle);
      }
    }
  }

  const cycleKeys = new Set(cycles.flat());

  for (const key of map.keys()) {
    if (cycleKeys.has(key)) {
      resolved.set(key, map.get(key)!);
      continue;
    }
    const value = resolveValue(key, map, new Set(), cache, options, 0);
    if (value === undefined) {
      unresolved.push(key);
      resolved.set(key, map.get(key)!);
    } else {
      if (options.strict && VAR_PATTERN.test(value)) {
        unresolved.push(key);
      }
      resolved.set(key, value);
    }
  }

  return { resolved, unresolved, cycles };
}

export function formatInterpolationReport(result: InterpolationResult): string {
  const lines: string[] = ['=== Interpolation Report ==='];
  lines.push(`Resolved keys : ${result.resolved.size}`);
  if (result.unresolved.length > 0) {
    lines.push(`Unresolved     : ${result.unresolved.join(', ')}`);
  }
  if (result.cycles.length > 0) {
    lines.push('Cycles detected:');
    for (const cycle of result.cycles) {
      lines.push(`  ${cycle.join(' -> ')}`);
    }
  }
  if (result.unresolved.length === 0 && result.cycles.length === 0) {
    lines.push('All variables resolved successfully.');
  }
  return lines.join('\n');
}
