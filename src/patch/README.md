# `src/patch` — Env Patcher Module

Applies a **source** `.env` map onto a **target** `.env` map with fine-grained control over how conflicts and missing keys are handled.

## API

### `applyPatch(target, source, options?): PatchResult`

Patches `target` in-place using values from `source`.

| Option | Type | Default | Description |
|---|---|---|---|
| `overwrite` | `boolean` | `true` | Overwrite existing keys in target |
| `prune` | `boolean` | `false` | Delete target keys absent from source |
| `excludeKeys` | `string[]` | `[]` | Keys to leave untouched |
| `dryRun` | `boolean` | `false` | Simulate patch without mutating target |

### `formatPatchReport(result): string`

Returns a human-readable summary of the patch result.

```
Patch summary: +2 added, ~1 updated, -0 deleted, 1 skipped

  [+] NEW_KEY: value
  [~] EXISTING_KEY: old → new
  [=] SKIPPED_KEY: unchanged
```

## Operations

- `add` — key exists in source but not in target
- `update` — key exists in both; source value wins (when `overwrite: true`)
- `delete` — key exists in target but not in source (when `prune: true`)
- `skip` — key excluded or overwrite disabled
