export type ScopeType = "WebPageNode" | "DesignPageNode" | "ComponentNode";

export interface ScopeInfo {
  scopeType: ScopeType;
  scopeId: string;
  scopeName?: string;
  urlPath: string | null;
}

export interface HistoryEntry {
  nodeId: string;
  nodeName: string;
  scopeType?: ScopeType;
  scopeId?: string;
  scopeName?: string;
  urlPath?: string | null;
  isReplica?: boolean;
  originalNodeId?: string;
  timestamp: number;
}

export type CopyState = "empty" | "copied" | "ready" | "failed";
