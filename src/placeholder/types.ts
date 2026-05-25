export interface PlaceholderEntry {
  key: string;
  placeholder: string;
  description?: string;
}

export interface PlaceholderMap {
  entries: PlaceholderEntry[];
}

export interface PlaceholderResult {
  filled: Map<string, string>;
  missing: string[];
  extra: string[];
}

export interface PlaceholderReport {
  total: number;
  filled: number;
  missing: number;
  extra: number;
  missingKeys: string[];
  extraKeys: string[];
}
