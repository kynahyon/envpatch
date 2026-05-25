export type CoerceType = 'string' | 'number' | 'boolean' | 'json';

export interface CoerceRule {
  key: string;
  type: CoerceType;
}

export interface CoerceResult {
  key: string;
  originalValue: string;
  coercedValue: string;
  type: CoerceType;
  success: boolean;
  error?: string;
}

export interface CoerceReport {
  results: CoerceResult[];
  successCount: number;
  failureCount: number;
}
