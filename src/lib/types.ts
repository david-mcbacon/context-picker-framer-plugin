export interface HistoryEntry {
  nodeId: string;
  nodeName: string;
  timestamp: number;
}

export type CopyState = "empty" | "copied" | "ready" | "failed";
