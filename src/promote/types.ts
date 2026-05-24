export interface PromoteOptions {
  overwrite?: boolean;
  dryRun?: boolean;
  keysToPromote?: string[];
}

export interface PromoteResult {
  promoted: Map<string, { from: string; to: string | undefined }>;
  skipped: Map<string, { reason: string }>;
  dryRun: boolean;
}

export type EnvMap = Map<string, string>;
