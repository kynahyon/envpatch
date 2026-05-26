export interface BoundaryRule {
  key: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: RegExp;
}

export interface BoundaryViolation {
  key: string;
  value: string;
  rule: string;
  detail: string;
}

export interface BoundaryResult {
  valid: boolean;
  violations: BoundaryViolation[];
  checkedCount: number;
  violationCount: number;
}
