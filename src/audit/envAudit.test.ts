import {
  createAuditEntry,
  appendAuditEntry,
  filterAuditLog,
  formatAuditReport,
} from './envAudit';
import { AuditLog } from './types';

const emptyLog: AuditLog = { entries: [] };

describe('createAuditEntry', () => {
  it('creates an entry with the correct action and description', () => {
    const entry = createAuditEntry('merge', 'Merged base with override', ['KEY_A', 'KEY_B']);
    expect(entry.action).toBe('merge');
    expect(entry.description).toBe('Merged base with override');
    expect(entry.affectedKeys).toEqual(['KEY_A', 'KEY_B']);
    expect(entry.id).toBeTruthy();
    expect(entry.timestamp).toBeTruthy();
  });

  it('includes optional meta when provided', () => {
    const entry = createAuditEntry('export', 'Exported as JSON', [], { format: 'json' });
    expect(entry.meta).toEqual({ format: 'json' });
  });

  it('omits meta when not provided', () => {
    const entry = createAuditEntry('validate', 'Validated env map', ['PORT']);
    expect(entry.meta).toBeUndefined();
  });
});

describe('appendAuditEntry', () => {
  it('appends an entry to an empty log', () => {
    const entry = createAuditEntry('patch', 'Applied patch', ['DB_URL']);
    const log = appendAuditEntry(emptyLog, entry);
    expect(log.entries).toHaveLength(1);
    expect(log.entries[0]).toBe(entry);
  });

  it('does not mutate the original log', () => {
    const entry = createAuditEntry('rollback', 'Rolled back', ['SECRET']);
    appendAuditEntry(emptyLog, entry);
    expect(emptyLog.entries).toHaveLength(0);
  });
});

describe('filterAuditLog', () => {
  it('returns only entries matching the given action', () => {
    let log = appendAuditEntry(emptyLog, createAuditEntry('merge', 'merge op', ['A']));
    log = appendAuditEntry(log, createAuditEntry('patch', 'patch op', ['B']));
    log = appendAuditEntry(log, createAuditEntry('merge', 'another merge', ['C']));
    const merges = filterAuditLog(log, 'merge');
    expect(merges).toHaveLength(2);
    merges.forEach((e) => expect(e.action).toBe('merge'));
  });
});

describe('formatAuditReport', () => {
  it('returns empty message for empty log', () => {
    expect(formatAuditReport(emptyLog)).toBe('Audit log is empty.');
  });

  it('includes action and description in report', () => {
    const log = appendAuditEntry(
      emptyLog,
      createAuditEntry('schema-validate', 'Schema validated', ['HOST'])
    );
    const report = formatAuditReport(log);
    expect(report).toContain('schema-validate');
    expect(report).toContain('Schema validated');
    expect(report).toContain('HOST');
  });
});
