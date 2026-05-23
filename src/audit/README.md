# Audit Module

The `audit` module provides a lightweight, immutable audit log for tracking actions performed on `.env` maps throughout the `envpatch` lifecycle.

## Types

### `AuditAction`
A union of supported action strings:
- `merge` — two env maps were merged
- `patch` — a patch was applied
- `rollback` — a rollback was performed
- `validate` — an env map was validated
- `export` — an env map was exported
- `import` — an env map was imported
- `schema-validate` — schema validation was run

### `AuditEntry`
Represents a single recorded action.

### `AuditLog`
A collection of `AuditEntry` records.

## API

### `createAuditEntry(action, description, affectedKeys, meta?)`
Creates a new `AuditEntry` with a generated ID and ISO timestamp.

### `appendAuditEntry(log, entry)`
Returns a new `AuditLog` with the entry appended. The original log is not mutated.

### `filterAuditLog(log, action)`
Returns all entries matching the specified `AuditAction`.

### `formatAuditReport(log)`
Returns a human-readable string summary of the audit log.

## Example

```ts
import { createAuditEntry, appendAuditEntry, formatAuditReport } from './src/audit';

let log = { entries: [] };
log = appendAuditEntry(log, createAuditEntry('merge', 'Merged prod with base', ['DB_URL']));
console.log(formatAuditReport(log));
```
