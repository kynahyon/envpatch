export type FieldType = 'string' | 'number' | 'boolean' | 'url' | 'email';

export interface FieldSchema {
  type: FieldType;
  required?: boolean;
  default?: string;
  pattern?: RegExp;
  description?: string;
}

export interface EnvSchema {
  fields: Record<string, FieldSchema>;
}

export interface SchemaValidationError {
  key: string;
  message: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
  missing: string[];
  extra: string[];
}
