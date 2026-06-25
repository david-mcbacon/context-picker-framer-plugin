import type { CanvasNode } from "@framer/plugin";
import { getNodeName } from "./node";

export function formatNodeAsJSON(node: CanvasNode): {
  nodeId: string;
  nodeName: string;
} {
  return {
    nodeId: node.id,
    nodeName: getNodeName(node),
  };
}

export function formatSelectionAsJSON(selection: CanvasNode[]) {
  const formattedSelection = selection.map(formatNodeAsJSON);
  return JSON.stringify(
    formattedSelection.length === 1
      ? formattedSelection[0]
      : formattedSelection,
  );
}
