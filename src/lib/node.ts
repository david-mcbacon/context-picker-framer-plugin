import type { CanvasNode } from "@framer/plugin";

export function getNodeName(node: CanvasNode) {
  return "name" in node && node.name ? node.name : "Unknown";
}
