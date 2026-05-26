export interface CascadeLayer {
  name: string;
  priority: number; // higher = overrides lower
}

export interface CascadeEntry {
  key: string;
  value: string;
  comment?: string;
  source: string;
  layer: CascadeLayer;
}

export interface CascadeResult {
  resolved: Map<string, CascadeEntry>;
  overrides: Array<{
    key: string;
    winner: CascadeEntry;
    losers: CascadeEntry[];
  }>;
  layers: CascadeLayer[];
}
