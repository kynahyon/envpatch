# envpatch

> Utility to safely merge and validate `.env` files across environments with conflict detection.

---

## Installation

```bash
npm install envpatch
# or
npx envpatch
```

---

## Usage

```typescript
import { envpatch } from 'envpatch';

// Merge a base .env with an environment-specific override
envpatch({
  base: '.env',
  patch: '.env.production',
  output: '.env.merged',
  strict: true, // throw on conflicts
});
```

Run from the CLI:

```bash
npx envpatch --base .env --patch .env.production --output .env.merged
```

**Conflict detection** — if a key exists in both files with different values, `envpatch` will warn (or throw in strict mode) rather than silently overwrite.

**Validation** — missing required keys defined in `.env.example` are flagged before deployment.

---

## Options

| Option     | Type      | Description                              |
|------------|-----------|------------------------------------------|
| `base`     | `string`  | Path to the base `.env` file             |
| `patch`    | `string`  | Path to the override `.env` file         |
| `output`   | `string`  | Destination path for the merged file     |
| `strict`   | `boolean` | Throw on conflicts instead of warning    |
| `validate` | `string`  | Path to `.env.example` for key validation|

---

## License

[MIT](./LICENSE)