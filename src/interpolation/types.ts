export interface InterpolationOptions {
  /** Allow referencing variables defined earlier in the same map */
  selfReference?: boolean;
  /** Throw on unresolved references instead of leaving them as-is */
  strict?: boolean;
  /** Maximum depth for nested interpolation resolution */
  maxDepth?: number;
}

export interface InterpolationResult {
  resolved: Map<string, string>;
  unresolved: string[];
  cycles: string[][];
}

export type EnvMap = Map<string, string>;
