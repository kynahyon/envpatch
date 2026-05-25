export interface DeprecatedKeyEntry {
  key: string;
  reason: string;
  replacedBy?: string;
}

export interface DeprecateOptions {
  /** List of deprecated key definitions */
  deprecated: DeprecatedKeyEntry[];
  /** If true, remove deprecated keys from the result map */
  removeDeprecated?: boolean;
}

export interface DeprecateResult {
  /** The resulting env map (with deprecated keys optionally removed) */
  result: Map<string, string>;
  /** Keys that were found and are deprecated */
  found: DeprecatedKeyEntry[];
  /** Keys that were not present in the map */
  notFound: string[];
}
