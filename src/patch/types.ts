export type PatchOperation = 'add' | 'update' | 'delete' | 'skip';

export interface PatchEntry {
  key: string;
  operation: PatchOperation;
  sourceValue?: string;
  targetValue?: string;
  resultValue?: string;
}

export interface PatchResult {
  entries: PatchEntry[];
  addedCount: number;
  updatedCount: number;
  deletedCount: number;
  skippedCount: number;
  success: boolean;
}

export interface PatchOptions {
  /** Overwrite existing keys in target */
  overwrite?: boolean;
  /** Delete keys from target that are not in source */
  prune?: boolean;
  /** Keys to exclude from patching */
  excludeKeys?: string[];
  /** Dry run — compute result without applying */
  dryRun?: boolean;
}

/**
 * Returns all entries from a PatchResult that match the given operation.
 */
export function filterEntriesByOperation(
  result: PatchResult,
  operation: PatchOperation
): PatchEntry[] {
  return result.entries.filter((entry) => entry.operation === operation);
}
