export type ExportFormat = 'dotenv' | 'json' | 'yaml' | 'shell';

export interface ExportOptions {
  format: ExportFormat;
  includeComments?: boolean;
  sortKeys?: boolean;
  header?: string;
}

export interface ExportResult {
  format: ExportFormat;
  content: string;
  keyCount: number;
  exportedAt: string;
}

export interface ExportError {
  format: ExportFormat;
  message: string;
}
