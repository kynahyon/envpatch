export interface SanitizeRule {
  /** Strip leading/trailing whitespace from values */
  trimValues?: boolean;
  /** Remove null bytes and non-printable characters from values */
  removeNonPrintable?: boolean;
  /** Collapse multiple consecutive whitespace characters into one */
  collapseWhitespace?: boolean;
  /** Strip surrounding quotes (single or double) from values */
  stripQuotes?: boolean;
}

export interface SanitizeResult {
  sanitized: Map<string, string>;
  changes: SanitizeChange[];
}

export interface SanitizeChange {
  key: string;
  before: string;
  after: string;
  rules: string[];
}
