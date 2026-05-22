import { EnvMap } from '../parser/types';
import { EnvHistoryEntry, EnvHistory } from './types';

/**
 * Creates a new history entry for an EnvMap state.
 */
export function createHistoryEntry(
  map: EnvMap,
  label?: string
): EnvHistoryEntry {
  return {
    timestamp: new Date().toISOString(),
    label: label ?? `snapshot-${Date.now()}`,
    entries: new Map(map),
  };
}

/**
 * Pushes a new entry onto the history stack.
 */
export function pushHistory(
  history: EnvHistory,
  map: EnvMap,
  label?: string
): EnvHistory {
  const entry = createHistoryEntry(map, label);
  return {
    entries: [...history.entries, entry],
  };
}

/**
 * Retrieves the most recent entry from history.
 */
export function peekHistory(history: EnvHistory): EnvHistoryEntry | undefined {
  if (history.entries.length === 0) return undefined;
  return history.entries[history.entries.length - 1];
}

/**
 * Rolls back to the previous entry, returning the restored map and updated history.
 */
export function rollbackHistory(
  history: EnvHistory
): { map: EnvMap; history: EnvHistory } | undefined {
  if (history.entries.length === 0) return undefined;
  const updated = history.entries.slice(0, -1);
  const previous = updated[updated.length - 1];
  if (!previous) return undefined;
  return {
    map: new Map(previous.entries),
    history: { entries: updated },
  };
}

/**
 * Formats a human-readable history report.
 */
export function formatHistoryReport(history: EnvHistory): string {
  if (history.entries.length === 0) return 'No history recorded.';
  const lines = history.entries.map(
    (e, i) =>
      `  [${i + 1}] ${e.timestamp} — ${e.label} (${e.entries.size} keys)`
  );
  return `Env History (${history.entries.length} entries):\n${lines.join('\n')}`;
}
