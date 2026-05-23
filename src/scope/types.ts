export type ScopeMode = "include" | "exclude";

export interface ScopeOptions {
  keys: string[];
  mode: ScopeMode;
}

export interface ScopedEnvResult {
  scoped: Map<string, string>;
  excluded: Map<string, string>;
  includedKeys: string[];
  excludedKeys: string[];
  mode: ScopeMode;
}
