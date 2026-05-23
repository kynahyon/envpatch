# envpatch — Interpolation Module

Resolves variable references within `.env` maps, supporting both `${VAR}` and `$VAR` syntax.

## Usage

```typescript
import { interpolateEnvMap, formatInterpolationReport } from './index';

const map = new Map([
  ['BASE_URL', 'https://example.com'],
  ['API_URL', '${BASE_URL}/api/v1'],
  ['HEALTH', '${API_URL}/health'],
]);

const result = interpolateEnvMap(map);
console.log(result.resolved.get('HEALTH'));
// => 'https://example.com/api/v1/health'

console.log(formatInterpolationReport(result));
```

## API

### `interpolateEnvMap(map, options?)`

Resolves all interpolated variable references in the provided env map.

**Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| `selfReference` | `boolean` | `false` | Allow forward self-reference |
| `strict` | `boolean` | `false` | Fail on unresolved references |
| `maxDepth` | `number` | `10` | Max recursion depth |

**Returns:** `InterpolationResult`
- `resolved` — fully interpolated map
- `unresolved` — keys with unresolvable references
- `cycles` — arrays of keys forming circular references

### `formatInterpolationReport(result)`

Returns a human-readable summary of the interpolation result.

## Notes

- Cyclic references are detected before resolution; affected keys retain their raw values.
- Unresolvable references are left as-is unless `strict` mode is enabled.
