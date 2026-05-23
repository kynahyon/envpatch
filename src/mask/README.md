# envMasker

Masks sensitive values in `.env` maps to prevent accidental exposure in logs, reports, or exports.

## Features

- Detects sensitive keys by pattern (e.g. `SECRET`, `PASSWORD`, `TOKEN`, `KEY`, `API`)
- Configurable custom sensitive key patterns
- Partial masking (show first N chars) or full masking
- Generates a mask report listing which keys were masked

## Usage

```typescript
import { maskEnvMap, formatMaskReport } from 'envpatch/mask';

const masked = maskEnvMap(envMap, {
  showFirst: 2,
  customPatterns: ['PRIVATE'],
});

console.log(formatMaskReport(masked.report));
```

## API

### `isSensitiveKey(key: string, customPatterns?: string[]): boolean`

Returns `true` if the key matches any known sensitive pattern.

### `maskValue(value: string, showFirst?: number): string`

Masks a value, optionally showing the first `showFirst` characters.

### `maskEnvMap(map: EnvMap, options?: MaskOptions): MaskResult`

Returns a new `EnvMap` with sensitive values masked, along with a `MaskReport`.

### `formatMaskReport(report: MaskReport): string`

Formats the mask report as a human-readable string.
