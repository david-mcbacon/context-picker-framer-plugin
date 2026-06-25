import type { CanvasNode } from "@framer/plugin";
import { getNodeName } from "./node";
import type { PageInfo } from "./types";

export function formatNodeAsJSON(
  node: CanvasNode,
  pageInfo?: PageInfo | null,
): {
  nodeId: string;
  nodeName: string;
  pageType?: string;
  pageId?: string;
  pagePath?: string;
} {
  return {
    nodeId: node.id,
    nodeName: getNodeName(node),
    ...(pageInfo ?? {}),
  };
}

export function formatSelectionAsJSON(
  selection: CanvasNode[],
  pageInfo?: PageInfo | null,
) {
  const formattedSelection = selection.map((node) =>
    formatNodeAsJSON(node, pageInfo),
  );
  return JSON.stringify(
    formattedSelection.length === 1
      ? formattedSelection[0]
      : formattedSelection,
  );
}
