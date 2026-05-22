/**
 * Types for env diff operations.
 */

export type DiffOperation = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry {
  key: string;
  operation: DiffOperation;
  oldValue?: string;
  newValue?: string;
}

export interface EnvDiff {
  entries: DiffEntry[];
  addedCount: number;
  removedCount: number;
  changedCount: number;
  unchangedCount: number;
}

export interface DiffOptions {
  /** If true, include unchanged keys in the diff output */
  includeUnchanged?: boolean;
  /** Keys to exclude from the diff */
  ignoreKeys?: string[];
}
