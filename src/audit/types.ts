export type AuditAction =
  | 'merge'
  | 'patch'
  | 'rollback'
  | 'validate'
  | 'export'
  | 'import'
  | 'schema-validate';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  description: string;
  affectedKeys: string[];
  meta?: Record<string, unknown>;
}

export interface AuditLog {
  entries: AuditEntry[];
}
