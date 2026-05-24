export interface EnvTag {
  key: string;
  tags: string[];
}

export interface TaggedEnvMap {
  entries: Map<string, string>;
  tags: Map<string, string[]>;
}

export interface TagFilterOptions {
  matchAll?: boolean; // default: false (match any)
}

export interface TagReport {
  tagged: EnvTag[];
  untagged: string[];
  totalKeys: number;
  totalTags: number;
}
