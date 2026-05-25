# envWatch

Detects changes between two `EnvMap` snapshots, reporting added, removed, and changed keys.

## Usage

```typescript
import { watchEnvMap, formatWatchReport } from './index';

const previous = parseEnvContent('A=1\nB=old');
const current = parseEnvContent('A=1\nB=new\nC=added');

const result = watchEnvMap(previous, current);
console.log(formatWatchReport(result));
```

## Output

```
[EnvWatch Report]
  Added: 1, Removed: 0, Changed: 1
  + C=added
  ~ B: old -> new
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `debounceMs` | `number` | — | Reserved for future file-watch debounce support |
| `keys` | `string[]` | all | Only watch specific keys |
| `ignoreUnchanged` | `boolean` | `true` | Skip events for keys with identical values |

## API

### `watchEnvMap(previous, current, options?): WatchResult`

Compares two `EnvMap` instances and returns a `WatchResult` with all detected events.

### `formatWatchReport(result): string`

Formats a `WatchResult` into a human-readable report string.
