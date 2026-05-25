export interface WatchOptions {
  debounceMs?: number;
  keys?: string[];
  ignoreUnchanged?: boolean;
}

export interface WatchEvent {
  type: 'added' | 'removed' | 'changed';
  key: string;
  oldValue?: string;
  newValue?: string;
  timestamp: Date;
}

export interface WatchResult {
  events: WatchEvent[];
  previousSnapshot: Map<string, string>;
  currentSnapshot: Map<string, string>;
  changedCount: number;
  addedCount: number;
  removedCount: number;
}
