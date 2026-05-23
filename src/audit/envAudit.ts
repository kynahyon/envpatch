import { AuditAction, AuditEntry, AuditLog } from './types';

let _idCounter = 0;

function generateId(): string {
  _idCounter += 1;
  return `audit-${Date.now()}-${_idCounter}`;
}

export function createAuditEntry(
  action: AuditAction,
  description: string,
  affectedKeys: string[],
  meta?: Record<string, unknown>
): AuditEntry {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    action,
    description,
    affectedKeys: [...affectedKeys],
    ...(meta !== undefined ? { meta } : {}),
  };
}

export function appendAuditEntry(log: AuditLog, entry: AuditEntry): AuditLog {
  return {
    entries: [...log.entries, entry],
  };
}

export function filterAuditLog(
  log: AuditLog,
  action: AuditAction
): AuditEntry[] {
  return log.entries.filter((e) => e.action === action);
}

export function formatAuditReport(log: AuditLog): string {
  if (log.entries.length === 0) {
    return 'Audit log is empty.';
  }

  const lines: string[] = ['=== Audit Log ==='];
  for (const entry of log.entries) {
    lines.push(`[${entry.timestamp}] (${entry.action}) ${entry.description}`);
    if (entry.affectedKeys.length > 0) {
      lines.push(`  Keys: ${entry.affectedKeys.join(', ')}`);
    }
    if (entry.meta && Object.keys(entry.meta).length > 0) {
      lines.push(`  Meta: ${JSON.stringify(entry.meta)}`);
    }
  }
  return lines.join('\n');
}
