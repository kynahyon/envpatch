export type EnvTypeRule = {
  key: string;
  expectedType: 'string' | 'number' | 'boolean' | 'url' | 'email' | 'integer';
  optional?: boolean;
};

export type TypeCheckResult = {
  key: string;
  value: string;
  expectedType: EnvTypeRule['expectedType'];
  valid: boolean;
  reason?: string;
};

export type TypeCheckReport = {
  results: TypeCheckResult[];
  passCount: number;
  failCount: number;
  skippedCount: number;
};
