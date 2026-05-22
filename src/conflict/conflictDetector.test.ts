import { detectConflicts, formatConflictReport } from './conflictDetector';

describe('detectConflicts', () => {
  it('returns empty report when there are no conflicts', () => {
    const base = new Map([['KEY_A', 'value_a']]);
    const patch = new Map([['KEY_B', 'value_b']]);
    const report = detectConflicts(base, patch);
    expect(report.conflicts).toHaveLength(0);
    expect(report.hasErrors).toBe(false);
    expect(report.hasWarnings).toBe(false);
  });

  it('detects a warning-level conflict for a changed key', () => {
    const base = new Map([['PORT', '3000']]);
    const patch = new Map([['PORT', '4000']]);
    const report = detectConflicts(base, patch);
    expect(report.conflicts).toHaveLength(1);
    expect(report.conflicts[0]).toMatchObject({
      key: 'PORT',
      baseValue: '3000',
      patchValue: '4000',
      severity: 'warning',
    });
    expect(report.hasWarnings).toBe(true);
    expect(report.hasErrors).toBe(false);
  });

  it('detects an error-level conflict for a key in errorKeys set', () => {
    const base = new Map([['DB_PASSWORD', 'secret']]);
    const patch = new Map([['DB_PASSWORD', 'new_secret']]);
    const report = detectConflicts(base, patch, new Set(['DB_PASSWORD']));
    expect(report.conflicts[0].severity).toBe('error');
    expect(report.hasErrors).toBe(true);
  });

  it('does not flag new keys in patch as conflicts', () => {
    const base = new Map([['KEY_A', 'val']]);
    const patch = new Map([['KEY_A', 'val'], ['KEY_NEW', 'new_val']]);
    const report = detectConflicts(base, patch);
    expect(report.conflicts).toHaveLength(0);
  });

  it('does not flag identical values as conflicts', () => {
    const base = new Map([['NODE_ENV', 'production']]);
    const patch = new Map([['NODE_ENV', 'production']]);
    const report = detectConflicts(base, patch);
    expect(report.conflicts).toHaveLength(0);
  });
});

describe('formatConflictReport', () => {
  it('returns a no-conflict message for an empty report', () => {
    const report = { conflicts: [], hasErrors: false, hasWarnings: false };
    expect(formatConflictReport(report)).toBe('No conflicts detected.');
  });

  it('includes conflict details in the formatted output', () => {
    const report = detectConflicts(
      new Map([['PORT', '3000']]),
      new Map([['PORT', '4000']])
    );
    const output = formatConflictReport(report);
    expect(output).toContain('PORT');
    expect(output).toContain('3000');
    expect(output).toContain('4000');
    expect(output).toContain('[WARN]');
  });
});
