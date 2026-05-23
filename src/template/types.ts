import { EnvMap } from '../parser/types';

export interface TemplateField {
  /** Whether this key must be present in the target env */
  required: boolean;
  /** Fallback value if the key is absent */
  defaultValue?: string;
  /** Human-readable description of the key's purpose */
  description?: string;
  /** Example value shown in generated .env.example files */
  example?: string;
}

export interface EnvTemplate {
  fields: Record<string, TemplateField>;
  /** ISO timestamp of when the template was created */
  createdAt: string;
}

export interface TemplateValidationResult {
  valid: boolean;
  /** Keys that are required but absent and have no default */
  missing: string[];
  /** Keys whose default values were substituted */
  defaultsApplied: Record<string, string>;
  /** The resolved EnvMap after applying defaults */
  resolved: EnvMap;
}
