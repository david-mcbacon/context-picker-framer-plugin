export type PageType = "web page" | "design page";

export interface PageInfo {
  pageType: PageType;
  pageId: string;
  pagePath?: string;
}

export interface HistoryEntry {
  nodeId: string;
  nodeName: string;
  pageType?: PageType;
  pageId?: string;
  pagePath?: string;
  timestamp: number;
}

export type CopyState = "empty" | "copied" | "ready" | "failed";
