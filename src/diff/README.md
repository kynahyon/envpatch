# `src/diff` — Env Diff Module

Computes the difference between two `.env` maps, categorising each key as **added**, **removed**, **changed**, or **unchanged**.

## API

### `diffEnvMaps(base, target, options?): EnvDiff`

Compares two `EnvMap` instances and returns an `EnvDiff` object.

| Option | Type | Default | Description |
|---|---|---|---|
| `includeUnchanged` | `boolean` | `false` | Include unchanged keys in the result entries |
| `ignoreKeys` | `string[]` | `[]` | Keys to skip during comparison |

### `formatDiffReport(diff): string`

Formats an `EnvDiff` into a human-readable string suitable for CLI output or logging.

```
Diff summary: +1 added, -1 removed, ~2 changed, =5 unchanged
  + NEW_KEY=value
  - OLD_KEY=value
  ~ CHANGED_KEY: "old" → "new"
```

## Types

- **`DiffOperation`** — `'added' | 'removed' | 'changed' | 'unchanged'`
- **`DiffEntry`** — A single key's diff result including `key`, `operation`, `oldValue`, and `newValue`.
- **`EnvDiff`** — Full diff result with `entries` array and summary counts.
- **`DiffOptions`** — Options passed to `diffEnvMaps`.

## Example

```ts
import { diffEnvMaps, formatDiffReport } from './src/diff';

const diff = diffEnvMaps(baseMap, targetMap, { ignoreKeys: ['SECRET'] });
console.log(formatDiffReport(diff));
```
