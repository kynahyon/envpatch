# envInheritor

Inherit environment variables from a parent `EnvMap` into a child `EnvMap`.
Child values always take precedence — only keys missing from the child are filled in from the parent.

## Usage

```typescript
import { inheritEnvMap, formatInheritReport } from './index';

const parent = new Map([
  ['DB_HOST', 'prod.db.example.com'],
  ['DB_PORT', '5432'],
  ['APP_SECRET', 'super-secret'],
]);

const child = new Map([
  ['DB_HOST', 'staging.db.example.com'],
]);

const result = inheritEnvMap(parent, child, { inheritAll: true });
// result.output => { DB_HOST: 'staging.db.example.com', DB_PORT: '5432', APP_SECRET: 'super-secret' }

console.log(formatInheritReport(result));
```

## Options

| Option | Type | Description |
|---|---|---|
| `inheritAll` | `boolean` | Inherit every key from parent not present in child |
| `keys` | `string[]` | Inherit only the listed keys |
| `stripPrefix` | `string` | Strip this prefix from parent keys before merging |

## Result

- `inherited` — keys that were copied from parent to child
- `skipped` — keys that existed in both; child value was kept
- `output` — the final merged map
