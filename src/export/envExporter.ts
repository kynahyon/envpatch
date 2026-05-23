import { EnvMap } from '../parser/types';
import { ExportOptions, ExportResult, ExportFormat } from './types';

function sortedEntries(map: EnvMap, sort: boolean): [string, string][] {
  const entries = Array.from(map.entries());
  return sort ? entries.sort(([a], [b]) => a.localeCompare(b)) : entries;
}

function exportAsDotenv(map: EnvMap, options: ExportOptions): string {
  const lines: string[] = [];
  if (options.header) {
    lines.push(`# ${options.header}`);
    lines.push('');
  }
  for (const [key, value] of sortedEntries(map, options.sortKeys ?? false)) {
    const needsQuotes = /\s|#|"/.test(value);
    lines.push(`${key}=${needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value}`);
  }
  return lines.join('\n');
}

function exportAsJson(map: EnvMap, options: ExportOptions): string {
  const obj: Record<string, string> = {};
  for (const [key, value] of sortedEntries(map, options.sortKeys ?? false)) {
    obj[key] = value;
  }
  return JSON.stringify(obj, null, 2);
}

function exportAsYaml(map: EnvMap, options: ExportOptions): string {
  const lines: string[] = [];
  if (options.header) {
    lines.push(`# ${options.header}`);
  }
  for (const [key, value] of sortedEntries(map, options.sortKeys ?? false)) {
    const needsQuotes = /[:#\[\]{}|>&*!,]/.test(value) || value.trim() !== value;
    lines.push(`${key}: ${needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value}`);
  }
  return lines.join('\n');
}

function exportAsShell(map: EnvMap, options: ExportOptions): string {
  const lines: string[] = [];
  if (options.header) {
    lines.push(`# ${options.header}`);
    lines.push('');
  }
  for (const [key, value] of sortedEntries(map, options.sortKeys ?? false)) {
    lines.push(`export ${key}="${value.replace(/"/g, '\\"')}"`);
  }
  return lines.join('\n');
}

const formatters: Record<ExportFormat, (map: EnvMap, opts: ExportOptions) => string> = {
  dotenv: exportAsDotenv,
  json: exportAsJson,
  yaml: exportAsYaml,
  shell: exportAsShell,
};

export function exportEnvMap(map: EnvMap, options: ExportOptions): ExportResult {
  const formatter = formatters[options.format];
  const content = formatter(map, options);
  return {
    format: options.format,
    content,
    keyCount: map.size,
    exportedAt: new Date().toISOString(),
  };
}

export function formatExportReport(result: ExportResult): string {
  return [
    `Export Report`,
    `  Format:   ${result.format}`,
    `  Keys:     ${result.keyCount}`,
    `  Exported: ${result.exportedAt}`,
  ].join('\n');
}
