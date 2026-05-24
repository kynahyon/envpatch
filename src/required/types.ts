export interface RequiredKeyResult {
  key: string;
  present: boolean;
  value?: string;
}

export interface RequiredCheckResult {
  passed: boolean;
  missing: string[];
  present: string[];
  results: RequiredKeyResult[];
}

export interface RequiredOptions {
  /** Keys that must be present and non-empty */
  keys: string[];
  /** If true, empty string values are treated as missing */
  strictEmpty?: boolean;
}
