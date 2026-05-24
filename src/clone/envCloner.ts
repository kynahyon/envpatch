import { EnvMap } from "../parser/types";

export interface CloneOptions {
  /** Only clone keys matching these prefixes */
  prefixes?: string[];
  /** Rename prefix in cloned map (e.g. APP_ -> CLONE_APP_) */
  addPrefix?: string;
  /** Strip a prefix from keys in the cloned map */
  stripPrefix?: string;
  /** Override specific keys in the clone */
  overrides?: Record<string, string>;
}

export interface CloneResult {
  cloned: EnvMap;
  skipped: string[];
  renamed: Array<{ from: string; to: string }>;
}

export function cloneEnvMap(source: EnvMap, options: CloneOptions = {}): CloneResult {
  const { prefixes, addPrefix, stripPrefix, overrides = {} } = options;
  const cloned: EnvMap = new Map();
  const skipped: string[] = [];
  const renamed: Array<{ from: string; to: string }> = [];

  for (const [key, entry] of source.entries()) {
    const matchesPrefix =
      !prefixes || prefixes.length === 0 || prefixes.some((p) => key.startsWith(p));

    if (!matchesPrefix) {
      skipped.push(key);
      continue;
    }

    let newKey = key;

    if (stripPrefix && newKey.startsWith(stripPrefix)) {
      newKey = newKey.slice(stripPrefix.length);
    }

    if (addPrefix) {
      newKey = `${addPrefix}${newKey}`;
    }

    if (newKey !== key) {
      renamed.push({ from: key, to: newKey });
    }

    const value = key in overrides ? overrides[key] : entry.value;
    cloned.set(newKey, { ...entry, value });
  }

  for (const [overrideKey, overrideValue] of Object.entries(overrides)) {
    if (!source.has(overrideKey) && !cloned.has(overrideKey)) {
      cloned.set(overrideKey, { value: overrideValue, comment: undefined, quoted: false });
    }
  }

  return { cloned, skipped, renamed };
}

export function formatCloneReport(result: CloneResult): string {
  const lines: string[] = ["[Clone Report]"];
  lines.push(`  Cloned keys : ${result.cloned.size}`);
  lines.push(`  Skipped keys: ${result.skipped.length}`);
  if (result.skipped.length > 0) {
    result.skipped.forEach((k) => lines.push(`    - ${k}`));
  }
  lines.push(`  Renamed keys: ${result.renamed.length}`);
  if (result.renamed.length > 0) {
    result.renamed.forEach(({ from, to }) => lines.push(`    ${from} -> ${to}`));
  }
  return lines.join("\n");
}
