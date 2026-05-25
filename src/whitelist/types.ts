export interface WhitelistOptions {
  /** List of allowed keys */
  allowedKeys: string[];
  /** If true, perform case-insensitive matching */
  caseInsensitive?: boolean;
  /** If true, strip disallowed keys from the result */
  stripDisallowed?: boolean;
}

export interface WhitelistResult {
  allowed: Map<string, string>;
  disallowed: Map<string, string>;
  totalKeys: number;
  allowedCount: number;
  disallowedCount: number;
}
