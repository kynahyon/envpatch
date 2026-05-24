export type MergeStrategyName = "ours" | "theirs" | "union" | "intersection";

export interface MergeStrategyOptions {
  strategy: MergeStrategyName;
  /** Keys to always prefer from base, regardless of strategy */
  preferBaseKeys?: string[];
  /** Keys to always prefer from incoming, regardless of strategy */
  preferIncomingKeys?: string[];
}

export interface MergeStrategyResult {
  merged: Map<string, string>;
  /** Keys that were resolved by the strategy (had conflicts) */
  resolved: string[];
  /** Keys only in base */
  baseOnly: string[];
  /** Keys only in incoming */
  incomingOnly: string[];
  /** Keys present in both with identical values */
  identical: string[];
  strategy: MergeStrategyName;
}
