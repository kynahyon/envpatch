import { EnvEntry, EnvMap } from '../parser/types';

export interface MaskedEnvEntry extends EnvEntry {
  masked: boolean;
}

export type MaskedEnvMap = Map<string, MaskedEnvEntry>;

export interface MaskOptions {
  /** Custom regex patterns to identify sensitive keys */
  patterns?: RegExp[];
  /** Number of trailing characters to keep visible (0 = fully masked) */
  visibleChars?: number;
  /** Character to use for masking (default: '*') */
  maskChar?: string;
  /** Explicit list of additional keys to mask regardless of pattern */
  additionalKeys?: string[];
}

export interface MaskResult {
  maskedMap: MaskedEnvMap;
  maskedKeys: string[];
}
