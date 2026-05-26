export interface ImmutableEntry {
  key: string;
  value: string;
  lockedAt: string;
}

export interface ImmutableResult {
  result: Map<string, string>;
  locked: ImmutableEntry[];
  attempted: string[];
  blocked: string[];
}

export interface ImmutableOptions {
  keys: string[];
  strict?: boolean; // throw on attempted mutation if true
}
