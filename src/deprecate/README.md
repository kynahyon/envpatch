# envDeprecator

Detects and optionally removes deprecated keys from an env map.

## Usage

```typescript
import { deprecateEnvKeys, formatDeprecateReport } from "./index";

const env = new Map([
  ["OLD_API_KEY", "secret"],
  ["PORT", "3000"],
]);

const result = deprecateEnvKeys(env, {
  deprecated: [
    { key: "OLD_API_KEY", reason: "Renamed for clarity", replacedBy: "API_KEY" },
  ],
  removeDeprecated: true,
});

console.log(formatDeprecateReport(result));
// === Deprecation Report ===
// Deprecated keys found (1):
//   - OLD_API_KEY: Renamed for clarity (use 'API_KEY' instead)
```

## API

### `deprecateEnvKeys(envMap, options): DeprecateResult`

Scans the env map for deprecated keys.

**Options:**
- `deprecated` — Array of `{ key, reason, replacedBy? }` entries.
- `removeDeprecated` — If `true`, removes deprecated keys from the result map.

**Returns:**
- `result` — New env map (original is not mutated).
- `found` — Deprecated entries that were present in the map.
- `notFound` — Deprecated keys that were not in the map.

### `formatDeprecateReport(result): string`

Returns a human-readable deprecation report.
