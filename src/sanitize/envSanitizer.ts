import { SanitizeRule, SanitizeResult, SanitizeChange } from './types';

function sanitizeValue(
  key: string,
  value: string,
  rule: SanitizeRule
): { after: string; appliedRules: string[] } {
  let result = value;
  const appliedRules: string[] = [];

  if (rule.trimValues) {
    const trimmed = result.trim();
    if (trimmed !== result) appliedRules.push('trimValues');
    result = trimmed;
  }

  if (rule.stripQuotes) {
    const stripped = result.replace(/^(['"])(.*?)\1$/, '$2');
    if (stripped !== result) appliedRules.push('stripQuotes');
    result = stripped;
  }

  if (rule.removeNonPrintable) {
    // eslint-disable-next-line no-control-regex
    const cleaned = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    if (cleaned !== result) appliedRules.push('removeNonPrintable');
    result = cleaned;
  }

  if (rule.collapseWhitespace) {
    const collapsed = result.replace(/[ \t]+/g, ' ');
    if (collapsed !== result) appliedRules.push('collapseWhitespace');
    result = collapsed;
  }

  return { after: result, appliedRules };
}

export function sanitizeEnvMap(
  env: Map<string, string>,
  rule: SanitizeRule = { trimValues: true, removeNonPrintable: true }
): SanitizeResult {
  const sanitized = new Map<string, string>();
  const changes: SanitizeChange[] = [];

  for (const [key, value] of env) {
    const { after, appliedRules } = sanitizeValue(key, value, rule);
    sanitized.set(key, after);
    if (appliedRules.length > 0) {
      changes.push({ key, before: value, after, rules: appliedRules });
    }
  }

  return { sanitized, changes };
}

export function formatSanitizeReport(result: SanitizeResult): string {
  if (result.changes.length === 0) {
    return 'Sanitize report: no changes applied.';
  }
  const lines = [`Sanitize report: ${result.changes.length} key(s) modified.`];
  for (const change of result.changes) {
    lines.push(
      `  [${change.key}] (${change.rules.join(', ')}): ${JSON.stringify(change.before)} -> ${JSON.stringify(change.after)}`
    );
  }
  return lines.join('\n');
}
