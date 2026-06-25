import type { CanvasNode } from "@framer/plugin";
import { getNodeName } from "./node";

export function formatNodeAsJSON(
  node: CanvasNode,
  pagePath?: string | null,
): {
  nodeId: string;
  nodeName: string;
  pagePath?: string | null;
} {
  return {
    nodeId: node.id,
    nodeName: getNodeName(node),
    ...(pagePath ? { pagePath } : {}),
  };
}

export function formatSelectionAsJSON(
  selection: CanvasNode[],
  pagePath?: string | null,
) {
  const formattedSelection = selection.map((node) =>
    formatNodeAsJSON(node, pagePath),
  );
  return JSON.stringify(
    formattedSelection.length === 1
      ? formattedSelection[0]
      : formattedSelection,
  );
}
