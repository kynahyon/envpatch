# envPrefixer

Add or remove key prefixes from an env map. Useful for namespacing variables by environment, service, or feature flag.

## Functions

### `addPrefix(map, prefix, options?)`

Returns a new `EnvMap` with `prefix` prepended to every key.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `separator` | `string` | `'_'` | Character placed between prefix and original key |
| `skipExisting` | `boolean` | `false` | Skip keys that already start with the prefix |
| `overwrite` | `boolean` | `false` | Allow overwriting keys that already exist after prefixing |

```ts
import { addPrefix } from './envPrefixer';

const result = addPrefix(map, 'PROD', { separator: '_' });
// { PROD_DB_HOST: ..., PROD_API_KEY: ... }
```

### `removePrefix(map, prefix, options?)`

Returns a new `EnvMap` with `prefix` stripped from matching keys. Non-matching keys are left untouched by default.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `separator` | `string` | `'_'` | Expected separator after the prefix |
| `dropUnmatched` | `boolean` | `false` | Exclude keys that do not carry the prefix |

```ts
import { removePrefix } from './envPrefixer';

const result = removePrefix(map, 'PROD', { dropUnmatched: true });
// { DB_HOST: ..., API_KEY: ... }
```

### `formatPrefixReport(report)`

Returns a human-readable summary of the prefix operation.

```
Prefix Report
  Operation : add
  Prefix    : PROD_
  Affected  : 4 keys
  Skipped   : 1 keys
```

## Use-cases

- Promote a staging env map to production namespace before merging.
- Strip environment prefixes before passing variables to a generic config reader.
- Isolate feature-flag keys under a `FF_` prefix.
