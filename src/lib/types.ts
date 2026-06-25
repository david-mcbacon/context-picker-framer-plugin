export interface HistoryEntry {
  nodeId: string;
  nodeName: string;
  pagePath?: string | null;
  timestamp: number;
}

export type CopyState = "empty" | "copied" | "ready" | "failed";
