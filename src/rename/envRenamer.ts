import { EnvMap } from '../parser/types';

export interface RenameRule {
  from: string;
  to: string;
}

export interface RenameResult {
  renamed: RenameRule[];
  skipped: RenameRule[];
  notFound: RenameRule[];
  output: EnvMap;
}

/**
 * Applies rename rules to an EnvMap, returning a new map with keys renamed.
 * Rules where `from` does not exist are recorded as notFound.
 * Rules where `to` already exists are skipped to avoid overwrites.
 */
export function renameEnvKeys(map: EnvMap, rules: RenameRule[]): RenameResult {
  const output: EnvMap = new Map(map);
  const renamed: RenameRule[] = [];
  const skipped: RenameRule[] = [];
  const notFound: RenameRule[] = [];

  for (const rule of rules) {
    if (!output.has(rule.from)) {
      notFound.push(rule);
      continue;
    }
    if (output.has(rule.to)) {
      skipped.push(rule);
      continue;
    }
    const entry = output.get(rule.from)!;
    output.set(rule.to, { ...entry });
    output.delete(rule.from);
    renamed.push(rule);
  }

  return { renamed, skipped, notFound, output };
}

export function formatRenameReport(result: RenameResult): string {
  const lines: string[] = ['=== Rename Report ==='];

  if (result.renamed.length > 0) {
    lines.push(`\nRenamed (${result.renamed.length}):`);
    for (const r of result.renamed) {
      lines.push(`  ${r.from} -> ${r.to}`);
    }
  }

  if (result.skipped.length > 0) {
    lines.push(`\nSkipped — target key already exists (${result.skipped.length}):`);
    for (const r of result.skipped) {
      lines.push(`  ${r.from} -> ${r.to}`);
    }
  }

  if (result.notFound.length > 0) {
    lines.push(`\nNot found — source key missing (${result.notFound.length}):`);
    for (const r of result.notFound) {
      lines.push(`  ${r.from}`);
    }
  }

  lines.push(`\nTotal keys in output: ${result.output.size}`);
  return lines.join('\n');
}
