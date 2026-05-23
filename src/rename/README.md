# envRenamer

Utility for renaming keys in an environment map using a rename rule map.

## Usage

```ts
import { renameEnvKeys, formatRenameReport } from './index';

const env = new Map([
  ['OLD_KEY', 'value1'],
  ['ANOTHER_KEY', 'value2'],
  ['UNCHANGED', 'value3'],
]);

const renames = {
  OLD_KEY: 'NEW_KEY',
  ANOTHER_KEY: 'BETTER_KEY',
};

const result = renameEnvKeys(env, renames);
console.log(formatRenameReport(result));
```

## API

### `renameEnvKeys(env, renames)`

Applies a rename map to the given environment map.

- `env`: `EnvMap` — the source environment map
- `renames`: `Record<string, string>` — mapping of old key names to new key names

Returns a `RenameResult` containing:
- `renamed`: `EnvMap` — the resulting map with keys renamed
- `applied`: `string[]` — list of keys that were successfully renamed
- `skipped`: `string[]` — list of keys in the rename map that were not found
- `conflicts`: `string[]` — list of target keys that already existed in the map

### `formatRenameReport(result)`

Formats a `RenameResult` into a human-readable string summary.

## Notes

- If a target key already exists in the map, the rename is skipped and the key is recorded under `conflicts`.
- Original key order is preserved where possible.
- Keys not present in the rename map are passed through unchanged.
