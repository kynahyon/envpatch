import { EnvMap } from '../parser/types';
import { PlaceholderMap, PlaceholderResult, PlaceholderReport } from './types';

/**
 * Replaces placeholder tokens in env values with actual values from a source map.
 * Placeholders use the format {{KEY}}.
 */
export function fillPlaceholders(
  template: EnvMap,
  source: EnvMap
): PlaceholderResult {
  const filled = new Map<string, string>();
  const missing: string[] = [];
  const usedKeys = new Set<string>();

  for (const [key, entry] of template) {
    const value = entry.value ?? '';
    const replaced = value.replace(/\{\{([^}]+)\}\}/g, (_, token: string) => {
      const trimmed = token.trim();
      const sourceEntry = source.get(trimmed);
      if (sourceEntry?.value !== undefined) {
        usedKeys.add(trimmed);
        return sourceEntry.value;
      }
      if (!missing.includes(trimmed)) {
        missing.push(trimmed);
      }
      return `{{${trimmed}}}`;
    });
    filled.set(key, replaced);
  }

  const extra: string[] = [];
  for (const key of source.keys()) {
    if (!usedKeys.has(key)) {
      extra.push(key);
    }
  }

  return { filled, missing, extra };
}

export function formatPlaceholderReport(
  result: PlaceholderResult
): PlaceholderReport {
  return {
    total: result.filled.size,
    filled: result.filled.size - result.missing.length,
    missing: result.missing.length,
    extra: result.extra.length,
    missingKeys: result.missing,
    extraKeys: result.extra,
  };
}

export function formatPlaceholderReportText(
  report: PlaceholderReport
): string {
  const lines: string[] = [
    `Placeholder Fill Report`,
    `  Total keys:  ${report.total}`,
    `  Filled:      ${report.filled}`,
    `  Missing:     ${report.missing}`,
    `  Extra:       ${report.extra}`,
  ];
  if (report.missingKeys.length > 0) {
    lines.push(`  Missing keys: ${report.missingKeys.join(', ')}`);
  }
  if (report.extraKeys.length > 0) {
    lines.push(`  Extra keys:   ${report.extraKeys.join(', ')}`);
  }
  return lines.join('\n');
}
