export type { ConflictSeverity, ConflictEntry, ConflictReport } from './conflictDetector';

/**
 * Options for conflict detection behaviour.
 */
export interface ConflictDetectionOptions {
  /**
   * Keys that should be treated as errors (rather than warnings) when
   * a conflict is detected. Useful for protecting sensitive or
   * infrastructure-critical variables.
   */
  errorKeys?: string[];

  /**
   * When true, the merge operation should abort if any error-level
   * conflicts are present.
   * @default true
   */
  failOnError?: boolean;

  /**
   * When true, the merge operation should abort if any warning-level
   * conflicts are present.
   * @default false
   */
  failOnWarning?: boolean;
}

/**
 * Default conflict detection options.
 */
export const DEFAULT_CONFLICT_OPTIONS: Required<ConflictDetectionOptions> = {
  errorKeys: [],
  failOnError: true,
  failOnWarning: false,
};
