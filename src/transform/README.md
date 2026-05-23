# envpatch — Transform Module

Apply custom transformation rules to environment variable values.

## Overview

The transform module allows you to define rules that match env keys by exact string or regex pattern and apply a transformation function to their values.

## Usage

```typescript
import { applyTransformRules, formatTransformReport } from './src/transform';
import { buildEnvMap } from './src/parser/envMapBuilder';
import { parseEnvContent } from './src/parser/envParser';

const entries = parseEnvContent('API_URL=http://localhost\nDB_PORT=5432');
const envMap = buildEnvMap(entries);

const { result, report } = applyTransformRules(envMap, [
  {
    key: 'API_URL',
    transform: (key, value) => value.replace('http://', 'https://'),
    description: 'force-https',
  },
  {
    key: /^DB_/,
    transform: (key, value) => value.trim(),
    description: 'trim-db-values',
  },
]);

console.log(formatTransformReport(report));
```

## API

### `applyTransformRules(envMap, rules)`

Applies each rule to matching keys. Only the **first matching rule** is applied per key.

- `envMap` — input `EnvMap`
- `rules` — array of `TransformRule`
- Returns `{ result: EnvMap, report: TransformReport }`

### `formatTransformReport(report)`

Returns a human-readable summary of applied and skipped transformations.

## Types

- `TransformFn` — `(key: string, value: string) => string`
- `TransformRule` — `{ key: string | RegExp, transform: TransformFn, description?: string }`
- `TransformReport` — `{ applied, skipped, totalKeys }`
