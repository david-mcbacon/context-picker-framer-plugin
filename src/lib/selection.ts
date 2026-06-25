import type { CanvasNode } from "@framer/plugin";
import { getNodeName } from "./node";
import type { ScopeInfo } from "./types";

export function formatNodeAsJSON(
  node: CanvasNode,
  scopeInfo?: ScopeInfo | null,
): {
  nodeId: string;
  nodeName: string;
  scopeType?: string;
  scopeId?: string;
  scopeName?: string;
  urlPath?: string | null;
  isReplica?: boolean;
  originalNodeId?: string;
} {
  return {
    nodeId: node.id,
    nodeName: getNodeName(node),
    ...(scopeInfo ?? {}),
    ...(node.isReplica ? { isReplica: true } : {}),
    ...(node.originalId ? { originalNodeId: node.originalId } : {}),
  };
}

export function formatSelectionAsJSON(
  selection: CanvasNode[],
  scopeInfo?: ScopeInfo | null,
) {
  const formattedSelection = selection.map((node) =>
    formatNodeAsJSON(node, scopeInfo),
  );
  return JSON.stringify(
    formattedSelection.length === 1
      ? formattedSelection[0]
      : formattedSelection,
  );
}
