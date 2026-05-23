export type FilterMode = "include" | "exclude";

export interface FilterOptions {
  /** Keys to include or exclude depending on mode */
  keys?: string[];
  /** Glob-style prefix patterns, e.g. "DB_", "AWS_" */
  prefixes?: string[];
  /** Whether to include or exclude matched keys (default: "include") */
  mode?: FilterMode;
}

export interface FilterResult {
  filtered: Map<string, string>;
  removedKeys: string[];
  keptKeys: string[];
}
