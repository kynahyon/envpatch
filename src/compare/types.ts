export type CompareResult = "equal" | "different" | "missing_left" | "missing_right";

export interface CompareEntry {
  key: string;
  result: CompareResult;
  leftValue?: string;
  rightValue?: string;
}

export interface CompareReport {
  totalKeys: number;
  equal: number;
  different: number;
  missingLeft: number;
  missingRight: number;
  entries: CompareEntry[];
}
