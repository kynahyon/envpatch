# envpatch — Merge Strategy

The `merge-strategy` module provides configurable strategies for resolving conflicts when merging two `.env` maps.

## Strategies

| Strategy       | Description                                                      |
|----------------|------------------------------------------------------------------|
| `ours`         | Prefer base map values when a conflict occurs                    |
| `theirs`       | Prefer incoming map values when a conflict occurs                |
| `union`        | Include all keys from both maps (incoming wins on conflict)      |
| `intersection` | Include only keys present in **both** maps (incoming wins on conflict) |

## Usage

```ts
import { applyMergeStrategy, formatMergeStrategyReport } from "./src/merge-strategy";

const base = new Map([["PORT", "3000"], ["DB_HOST", "localhost"]]);
const incoming = new Map([["PORT", "8080"], ["API_KEY", "xyz"]]);

const result = applyMergeStrategy(base, incoming, {
  strategy: "ours",
  preferIncomingKeys: ["API_KEY"],
});

console.log(formatMergeStrategyReport(result));
```

## Options

```ts
interface MergeStrategyOptions {
  strategy: "ours" | "theirs" | "union" | "intersection";
  preferBaseKeys?: string[];     // Always use base value for these keys
  preferIncomingKeys?: string[]; // Always use incoming value for these keys
}
```

## Result

The result includes the merged map plus metadata:
- `resolved` — keys that had conflicting values
- `baseOnly` — keys only present in the base
- `incomingOnly` — keys only present in incoming
- `identical` — keys with matching values in both
