# Schema Validation

The `schema` module validates an `EnvMap` against a declared schema, ensuring each key has the correct type, required fields are present, and no unexpected keys exist.

## Usage

```typescript
import { validateEnvSchema, formatSchemaReport } from './src/schema';
import type { EnvSchema } from './src/schema';

const schema: EnvSchema = {
  fields: {
    PORT:       { type: 'number',  required: true },
    DEBUG:      { type: 'boolean', required: false, default: 'false' },
    API_URL:    { type: 'url',     required: true },
    ADMIN_EMAIL:{ type: 'email',   required: false },
    APP_NAME:   { type: 'string',  required: true },
  },
};

const result = validateEnvSchema(envMap, schema);
console.log(formatSchemaReport(result));
```

## Field Types

| Type      | Validation rule                        |
|-----------|----------------------------------------|
| `string`  | Any non-empty value                    |
| `number`  | Integer or decimal (`/^-?\d+(\.\d+)?$/`) |
| `boolean` | `true`, `false`, `1`, or `0`           |
| `url`     | Must start with `http://` or `https://`|
| `email`   | Basic `user@domain.tld` pattern        |

## Result Shape

```typescript
interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];  // type mismatches
  missing: string[];                // required keys absent
  extra: string[];                  // keys not declared in schema
}
```
