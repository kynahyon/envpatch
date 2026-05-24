export interface FlattenOptions {
  /** Separator used to join nested key segments (default: "__") */
  separator?: string;
  /** Optional prefix to prepend to all flattened keys */
  prefix?: string;
  /** If true, keys will be uppercased after flattening */
  uppercase?: boolean;
}

export interface FlattenResult {
  flatMap: Map<string, string>;
  originalCount: number;
  flattenedCount: number;
  renamedKeys: Array<{ original: string; flattened: string }>;
}
