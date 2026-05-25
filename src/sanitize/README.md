# envpatch — sanitize

Sanitize `.env` map values by applying configurable cleaning rules.

## Usage

```ts
import { sanitizeEnvMap, formatSanitizeReport } from './index';

const env = new Map([
  ['API_KEY', '  "my-secret"  '],
  ['HOST', 'localhost'],
]);

const result = sanitizeEnvMap(env, {
  trimValues: true,
  stripQuotes: true,
  removeNonPrintable: true,
  collapseWhitespace: false,
});

console.log(result.sanitized.get('API_KEY')); // 'my-secret'
console.log(formatSanitizeReport(result));
```

## Rules

| Rule | Description |
|---|---|
| `trimValues` | Strip leading/trailing whitespace from each value |
| `stripQuotes` | Remove matching surrounding `'` or `"` quotes |
| `removeNonPrintable` | Delete null bytes and other non-printable control characters |
| `collapseWhitespace` | Collapse runs of spaces/tabs inside a value into a single space |

All rules default to `false` except `trimValues` and `removeNonPrintable`,
which are enabled when no rule object is provided.

## Report

`formatSanitizeReport` returns a human-readable summary listing every key
that was modified, the rules that triggered, and the before/after values.
