/**
 * Represents a single key-value entry captured in a snapshot.
 */
export interface SnapshotEntry {
  key: string;
  value: string;
  comment?: string;
}

/**
 * Represents a complete snapshot of an EnvMap at a point in time.
 */
export interface EnvSnapshot {
  /** Human-readable label for the snapshot */
  label: string;
  /** ISO 8601 timestamp of when the snapshot was created */
  createdAt: string;
  /** All key-value entries captured */
  entries: SnapshotEntry[];
}
