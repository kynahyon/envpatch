export interface RedactOptions {
  /** List of exact keys to redact */
  keys?: string[];
  /** Regex patterns to match keys for redaction */
  patterns?: RegExp[];
  /** Replacement string (default: '[REDACTED]') */
  replacement?: string;
  /** Whether to redact partial values (e.g. show first N chars) */
  partialReveal?: number;
}

export interface RedactResult {
  original: Map<string, string>;
  redacted: Map<string, string>;
  redactedKeys: string[];
}

export interface RedactReport {
  totalKeys: number;
  redactedCount: number;
  redactedKeys: string[];
  replacement: string;
}
