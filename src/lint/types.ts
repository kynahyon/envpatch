export type LintSeverity = 'error' | 'warn' | 'info';

export interface LintRule {
  id: string;
  description: string;
  severity: LintSeverity;
}

export interface LintViolation {
  rule: LintRule;
  key: string;
  message: string;
}

export interface LintResult {
  violations: LintViolation[];
  errorCount: number;
  warnCount: number;
  infoCount: number;
  passed: boolean;
}

export interface LintOptions {
  allowEmptyValues?: boolean;
  requireUppercaseKeys?: boolean;
  forbidLeadingUnderscore?: boolean;
  maxKeyLength?: number;
  maxValueLength?: number;
}
