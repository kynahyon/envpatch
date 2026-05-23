export type TransformFn = (key: string, value: string) => string;

export interface TransformRule {
  key: string | RegExp;
  transform: TransformFn;
  description?: string;
}

export interface TransformResult {
  key: string;
  originalValue: string;
  transformedValue: string;
  ruleApplied: string;
}

export interface TransformReport {
  applied: TransformResult[];
  skipped: string[];
  totalKeys: number;
}
