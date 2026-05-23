export interface EnvGroup {
  name: string;
  keys: string[];
}

export interface GroupedEnvMap {
  groups: Record<string, Map<string, string>>;
  ungrouped: Map<string, string>;
}

export interface GroupOptions {
  /** Group keys by prefix delimiter, defaults to '_' */
  delimiter?: string;
  /** Explicit group definitions override prefix grouping */
  explicitGroups?: EnvGroup[];
  /** Whether to include ungrouped keys */
  includeUngrouped?: boolean;
}

export interface GroupReport {
  totalKeys: number;
  groupCount: number;
  ungroupedCount: number;
  groups: Array<{ name: string; keyCount: number; keys: string[] }>;
}
