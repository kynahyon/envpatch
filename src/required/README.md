# envpatch — Required Keys

Ensure that a set of required environment variable keys are present (and optionally non-empty) in an `EnvMap`.

## Usage

```typescript
import { checkRequiredKeys, formatRequiredReport } from './index';
import { buildEnvMap } from '../parser/envMapBuilder';
import { parseEnvContent } from '../parser/envParser';

const entries = parseEnvContent('DB_HOST=localhost\nDB_PORT=5432');
const env = buildEnvMap(entries);

const result = checkRequiredKeys(env, {
  keys: ['DB_HOST', 'DB_PORT', 'DB_PASS'],
  strictEmpty: true,
});

console.log(formatRequiredReport(result));
// Required Keys Check: FAILED
//   Present : 2
//   Missing : 1
//   Missing keys:
//     - DB_PASS
//   Present keys:
//     + DB_HOST
//     + DB_PORT
```

## API

### `checkRequiredKeys(env, options)`

| Parameter | Type | Description |
|---|---|---|
| `env` | `EnvMap` | The environment map to check |
| `options.keys` | `string[]` | List of required key names |
| `options.strictEmpty` | `boolean` | Treat empty-string values as missing (default: `true`) |

Returns a `RequiredCheckResult` with:
- `passed` — `true` if all keys are present
- `missing` — keys that were absent or empty
- `present` — keys that satisfied the requirement
- `results` — per-key detail array

### `formatRequiredReport(result)`

Formats the `RequiredCheckResult` into a human-readable string.
