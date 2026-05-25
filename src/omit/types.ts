export interface OmitOptions {
  /** Keys to omit from the env map */
  keys: string[];
  /** If true, treat keys as prefix patterns (e.g. 'SECRET_' omits all keys starting with 'SECRET_') */
  prefixMatch?: boolean;
  /** If true, matching is case-insensitive */
  caseInsensitive?: boolean;
}

export interface OmitResult {
  /** The resulting env map with specified keys removed */
  result: Map<string, string>;
  /** Keys that were actually omitted */
  omitted: string[];
  /** Keys that were requested but not found */
  notFound: string[];
}
