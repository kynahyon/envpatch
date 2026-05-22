import { EnvEntry, ParseResult } from './types';

/**
 * Parses the contents of a .env file into structured entries.
 * Supports comments, blank lines, and quoted values.
 */
export function parseEnvContent(content: string, source: string): ParseResult {
  const entries: EnvEntry[] = [];
  const errors: string[] = [];
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    // Skip blank lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      errors.push(`[${source}:${lineNumber}] Invalid entry (missing '='): "${trimmed}"`);
      return;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (!key) {
      errors.push(`[${source}:${lineNumber}] Empty key found`);
      return;
    }

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries.push({ key, value, source, lineNumber });
  });

  return { entries, errors };
}
