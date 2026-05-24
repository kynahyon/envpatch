export type AuditAction =
  | 'merge'
  | 'patch'
  | 'rollback'
  | 'validate'
  | 'export'
  | 'import'
  | 'schema-validate';

/** A single recorded audit event capturing what changed, when, and why. */
export interface AuditEntry {
  /** Unique identifier for this audit entry. */
  id: string;
  /** ISO 8601 timestamp of when the action occurred. */
  timestamp: string;
  /** The type of operation that was performed. */
  action: AuditAction;
  /** Human-readable description of the operation. */
  description: string;
  /** Environment variable keys that were affected by this operation. */
  affectedKeys: string[];
  /** Optional additional metadata about the operation (e.g. user, source file). */
  meta?: Record<string, unknown>;
}

/** Container for a sequence of audit entries forming a complete audit trail. */
export interface AuditLog {
  entries: AuditEntry[];
}
