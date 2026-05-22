/**
 * Represents a single key-value entry parsed from a .env file.
 */
export interface EnvEntry {
  key: string;
  value: string;
  source: string;
  lineNumber: number;
}

/**
 * Result returned after parsing a .env file.
 */
export interface ParseResult {
  entries: EnvEntry[];
  errors: string[];
}

/**
 * A flat map of environment key to value.
 */
export type EnvMap = Record<string, string>;

/**
 * Represents a detected conflict between two .env sources.
 */
export interface EnvConflict {
  key: string;
  baseValue: string;
  incomingValue: string;
  baseSource: string;
  incomingSource: string;
}
