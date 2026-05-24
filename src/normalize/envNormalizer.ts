import { EnvMap } from "../parser/types";

export interface NormalizeOptions {
  trimValues?: boolean;
  trimKeys?: boolean;
  uppercaseKeys?: boolean;
  lowercaseKeys?: boolean;
  removeEmptyValues?: boolean;
  collapseWhitespace?: boolean;
}

export interface NormalizeResult {
  normalized: EnvMap;
  changes: Array<{ key: string; field: "key" | "value"; before: string; after: string }>;
  removedKeys: string[];
}

export function normalizeEnvMap(map: EnvMap, options: NormalizeOptions = {}): NormalizeResult {
  const {
    trimValues = true,
    trimKeys = true,
    uppercaseKeys = false,
    lowercaseKeys = false,
    removeEmptyValues = false,
    collapseWhitespace = false,
  } = options;

  const normalized: EnvMap = new Map();
  const changes: NormalizeResult["changes"] = [];
  const removedKeys: string[] = [];

  for (const [key, entry] of map.entries()) {
    let normalizedKey = key;
    let normalizedValue = entry.value;

    if (trimKeys && normalizedKey !== normalizedKey.trim()) {
      changes.push({ key, field: "key", before: normalizedKey, after: normalizedKey.trim() });
      normalizedKey = normalizedKey.trim();
    }

    if (uppercaseKeys && normalizedKey !== normalizedKey.toUpperCase()) {
      changes.push({ key, field: "key", before: normalizedKey, after: normalizedKey.toUpperCase() });
      normalizedKey = normalizedKey.toUpperCase();
    } else if (lowercaseKeys && normalizedKey !== normalizedKey.toLowerCase()) {
      changes.push({ key, field: "key", before: normalizedKey, after: normalizedKey.toLowerCase() });
      normalizedKey = normalizedKey.toLowerCase();
    }

    if (trimValues && normalizedValue !== normalizedValue.trim()) {
      changes.push({ key: normalizedKey, field: "value", before: normalizedValue, after: normalizedValue.trim() });
      normalizedValue = normalizedValue.trim();
    }

    if (collapseWhitespace) {
      const collapsed = normalizedValue.replace(/\s+/g, " ");
      if (collapsed !== normalizedValue) {
        changes.push({ key: normalizedKey, field: "value", before: normalizedValue, after: collapsed });
        normalizedValue = collapsed;
      }
    }

    if (removeEmptyValues && normalizedValue === "") {
      removedKeys.push(normalizedKey);
      continue;
    }

    normalized.set(normalizedKey, { ...entry, value: normalizedValue });
  }

  return { normalized, changes, removedKeys };
}

export function formatNormalizeReport(result: NormalizeResult): string {
  const lines: string[] = ["Normalize Report", "================="];
  if (result.changes.length === 0 && result.removedKeys.length === 0) {
    lines.push("No changes made.");
    return lines.join("\n");
  }
  for (const change of result.changes) {
    lines.push(`  [${change.field.toUpperCase()}] ${change.key}: "${change.before}" → "${change.after}"`);
  }
  for (const key of result.removedKeys) {
    lines.push(`  [REMOVED] ${key} (empty value)`);
  }
  lines.push(`Total changes: ${result.changes.length}, Removed: ${result.removedKeys.length}`);
  return lines.join("\n");
}
