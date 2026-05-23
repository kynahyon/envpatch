export interface FreezeOptions {
  /** Keys to freeze (exact match) */
  keys?: string[];
  /** Key prefixes to freeze */
  prefixes?: string[];
  /** If true, any attempt to modify a frozen key is an error */
  strict?: boolean;
}

export interface FreezeResult {
  frozen: Map<string, string>;
  skipped: string[];
  violations: FreezeViolation[];
}

export interface FreezeViolation {
  key: string;
  originalValue: string;
  attemptedValue: string;
}
