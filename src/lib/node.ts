import type { CanvasNode } from "@framer/plugin";
import { MAX_NODE_NAME_LENGTH } from "./constants";

export function getNodeName(node: CanvasNode) {
  return truncateNodeName("name" in node && node.name ? node.name : "Unknown");
}

export function truncateNodeName(nodeName: string) {
  if (nodeName.length <= MAX_NODE_NAME_LENGTH) return nodeName;

  return `${nodeName.slice(0, MAX_NODE_NAME_LENGTH - 3)}...`;
}
