# envpatch — Tag Module

The **tag** module lets you attach arbitrary string labels (tags) to environment variable keys, then filter or report on them.

## API

### `tagEnvMap(entries, tagRules): TaggedEnvMap`

Attaches tags defined in `tagRules` to keys found in `entries`. Rules referencing unknown keys are silently ignored. Duplicate tags for the same key are deduplicated.

```ts
import { tagEnvMap } from 'envpatch/tag';

const tagged = tagEnvMap(envMap, [
  { key: 'DB_HOST', tags: ['database', 'infra'] },
  { key: 'API_KEY', tags: ['secret'] },
]);
```

### `filterByTags(tagged, requiredTags, options?): Map<string, string>`

Returns a new map containing only keys whose tag list satisfies the filter.

| Option | Default | Description |
|--------|---------|-------------|
| `matchAll` | `false` | If `true`, a key must have **all** required tags; otherwise any match suffices. |

```ts
import { filterByTags } from 'envpatch/tag';

const secrets = filterByTags(tagged, ['secret']);
const dbSecrets = filterByTags(tagged, ['database', 'secret'], { matchAll: true });
```

### `formatTagReport(tagged): string`

Returns a human-readable summary of tagged and untagged keys.

### `buildTagReport(tagged): TagReport`

Returns a structured `TagReport` object for programmatic use.

## Types

```ts
interface EnvTag       { key: string; tags: string[]; }
interface TaggedEnvMap { entries: Map<string, string>; tags: Map<string, string[]>; }
interface TagReport    { tagged: EnvTag[]; untagged: string[]; totalKeys: number; totalTags: number; }
```
