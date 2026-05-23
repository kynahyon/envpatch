import type { EnvMap } from '../parser/types';

export interface MaskOptions {
  /** Number of leading characters to reveal. Default: 0 (full mask). */
  showFirst?: number;
  /** Additional key patterns to treat as sensitive (case-insensitive). */
  customPatterns?: string[];
}

export interface MaskEntry {
  key: string;
  original: string;
  masked: string;
}

export interface MaskReport {
  maskedKeys: MaskEntry[];
  totalKeys: number;
  maskedCount: number;
}

export interface MaskResult {
  map: EnvMap;
  report: MaskReport;
}
