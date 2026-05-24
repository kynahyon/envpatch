export interface InheritOptions {
  /** Keys from parent that child should inherit if not already defined */
  keys?: string[];
  /** If true, inherit all keys from parent not present in child */
  inheritAll?: boolean;
  /** Prefix to strip from parent keys before inheriting */
  stripPrefix?: string;
}

export interface InheritResult {
  inherited: Map<string, string>;
  skipped: Map<string, string>;
  output: Map<string, string>;
}

export interface InheritReport {
  inheritedCount: number;
  skippedCount: number;
  inheritedKeys: string[];
  skippedKeys: string[];
}
