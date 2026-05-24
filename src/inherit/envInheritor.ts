import { EnvMap } from '../parser/types';
import { InheritOptions, InheritResult, InheritReport } from './types';

/**
 * Inherits keys from a parent EnvMap into a child EnvMap.
 * Child values always take precedence over parent values.
 */
export function inheritEnvMap(
  parent: EnvMap,
  child: EnvMap,
  options: InheritOptions = {}
): InheritResult {
  const { keys, inheritAll = false, stripPrefix = '' } = options;

  const inherited = new Map<string, string>();
  const skipped = new Map<string, string>();
  const output = new Map<string, string>(child);

  const parentEntries = [...parent.entries()];

  for (const [rawKey, value] of parentEntries) {
    const key = stripPrefix && rawKey.startsWith(stripPrefix)
      ? rawKey.slice(stripPrefix.length)
      : rawKey;

    const shouldConsider = inheritAll || (keys && keys.includes(key));
    if (!shouldConsider) continue;

    if (output.has(key)) {
      skipped.set(key, value);
    } else {
      output.set(key, value);
      inherited.set(key, value);
    }
  }

  return { inherited, skipped, output };
}

export function formatInheritReport(result: InheritResult): string {
  const report: InheritReport = {
    inheritedCount: result.inherited.size,
    skippedCount: result.skipped.size,
    inheritedKeys: [...result.inherited.keys()],
    skippedKeys: [...result.skipped.keys()],
  };

  const lines: string[] = [
    `Inherit Report`,
    `  Inherited : ${report.inheritedCount}`,
    `  Skipped   : ${report.skippedCount}`,
  ];

  if (report.inheritedKeys.length > 0) {
    lines.push(`  Inherited keys: ${report.inheritedKeys.join(', ')}`);
  }
  if (report.skippedKeys.length > 0) {
    lines.push(`  Skipped keys  : ${report.skippedKeys.join(', ')}`);
  }

  return lines.join('\n');
}
