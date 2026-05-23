import { EnvMap } from "../parser/types";
import { CompareEntry, CompareReport, CompareResult } from "./types";

export function compareEnvMaps(left: EnvMap, right: EnvMap): CompareReport {
  const allKeys = new Set([...left.keys(), ...right.keys()]);
  const entries: CompareEntry[] = [];

  for (const key of allKeys) {
    const hasLeft = left.has(key);
    const hasRight = right.has(key);
    const leftValue = left.get(key)?.value;
    const rightValue = right.get(key)?.value;

    let result: CompareResult;
    if (!hasLeft) {
      result = "missing_left";
    } else if (!hasRight) {
      result = "missing_right";
    } else if (leftValue === rightValue) {
      result = "equal";
    } else {
      result = "different";
    }

    entries.push({ key, result, leftValue, rightValue });
  }

  entries.sort((a, b) => a.key.localeCompare(b.key));

  return {
    totalKeys: allKeys.size,
    equal: entries.filter((e) => e.result === "equal").length,
    different: entries.filter((e) => e.result === "different").length,
    missingLeft: entries.filter((e) => e.result === "missing_left").length,
    missingRight: entries.filter((e) => e.result === "missing_right").length,
    entries,
  };
}

export function formatCompareReport(report: CompareReport): string {
  const lines: string[] = [
    `Compare Report: ${report.totalKeys} keys total`,
    `  Equal:         ${report.equal}`,
    `  Different:     ${report.different}`,
    `  Missing left:  ${report.missingLeft}`,
    `  Missing right: ${report.missingRight}`,
    "",
  ];

  for (const entry of report.entries) {
    switch (entry.result) {
      case "equal":
        lines.push(`  = ${entry.key}`);
        break;
      case "different":
        lines.push(`  ~ ${entry.key}: "${entry.leftValue}" → "${entry.rightValue}"`);
        break;
      case "missing_left":
        lines.push(`  + ${entry.key}: "${entry.rightValue}" (only in right)`);
        break;
      case "missing_right":
        lines.push(`  - ${entry.key}: "${entry.leftValue}" (only in left)`);
        break;
    }
  }

  return lines.join("\n");
}
