# envpatch — promote

Promote environment variables from one env map to another (e.g. staging → production).

## Usage

```typescript
import { promoteEnvMap, formatPromoteReport } from './index';

const staging = new Map([
  ['API_URL', 'https://staging.example.com'],
  ['FEATURE_FLAG', 'true'],
]);

const production = new Map([
  ['API_URL', 'https://prod.example.com'],
]);

const result = promoteEnvMap(staging, production, {
  overwrite: false,
  dryRun: false,
  keysToPromote: ['FEATURE_FLAG'],
});

console.log(formatPromoteReport(result));
```

## Options

| Option          | Type       | Default | Description                                          |
|-----------------|------------|---------|------------------------------------------------------|
| `overwrite`     | `boolean`  | `false` | Overwrite existing keys in the target map            |
| `dryRun`        | `boolean`  | `false` | Simulate promotion without mutating the target       |
| `keysToPromote` | `string[]` | all     | Subset of keys to promote; defaults to all source keys |

## Result

- `promoted` — keys successfully written to the target
- `skipped` — keys skipped with a reason (e.g. already exists, not in source)
- `dryRun` — whether the run was simulated
