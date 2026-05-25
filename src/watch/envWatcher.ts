import { EnvMap } from '../parser/types';
import { WatchOptions, WatchEvent, WatchResult } from './types';

export function watchEnvMap(
  previous: EnvMap,
  current: EnvMap,
  options: WatchOptions = {}
): WatchResult {
  const { keys, ignoreUnchanged = true } = options;

  const events: WatchEvent[] = [];
  const timestamp = new Date();

  const prevEntries = previous.entries;
  const currEntries = current.entries;

  const shouldWatch = (key: string): boolean =>
    !keys || keys.includes(key);

  // Detect removed and changed keys
  for (const [key, prevEntry] of prevEntries) {
    if (!shouldWatch(key)) continue;
    if (!currEntries.has(key)) {
      events.push({
        type: 'removed',
        key,
        oldValue: prevEntry.value,
        timestamp,
      });
    } else {
      const currEntry = currEntries.get(key)!;
      if (!ignoreUnchanged || prevEntry.value !== currEntry.value) {
        if (prevEntry.value !== currEntry.value) {
          events.push({
            type: 'changed',
            key,
            oldValue: prevEntry.value,
            newValue: currEntry.value,
            timestamp,
          });
        }
      }
    }
  }

  // Detect added keys
  for (const [key, currEntry] of currEntries) {
    if (!shouldWatch(key)) continue;
    if (!prevEntries.has(key)) {
      events.push({
        type: 'added',
        key,
        newValue: currEntry.value,
        timestamp,
      });
    }
  }

  const addedCount = events.filter((e) => e.type === 'added').length;
  const removedCount = events.filter((e) => e.type === 'removed').length;
  const changedCount = events.filter((e) => e.type === 'changed').length;

  return {
    events,
    previousSnapshot: new Map(
      [...prevEntries.entries()].map(([k, v]) => [k, v.value])
    ),
    currentSnapshot: new Map(
      [...currEntries.entries()].map(([k, v]) => [k, v.value])
    ),
    changedCount,
    addedCount,
    removedCount,
  };
}

export function formatWatchReport(result: WatchResult): string {
  const lines: string[] = ['[EnvWatch Report]'];
  lines.push(
    `  Added: ${result.addedCount}, Removed: ${result.removedCount}, Changed: ${result.changedCount}`
  );
  if (result.events.length === 0) {
    lines.push('  No changes detected.');
    return lines.join('\n');
  }
  for (const event of result.events) {
    if (event.type === 'added') {
      lines.push(`  + ${event.key}=${event.newValue}`);
    } else if (event.type === 'removed') {
      lines.push(`  - ${event.key}=${event.oldValue}`);
    } else {
      lines.push(`  ~ ${event.key}: ${event.oldValue} -> ${event.newValue}`);
    }
  }
  return lines.join('\n');
}
