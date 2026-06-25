import { framer, type CanvasRootNode } from "@framer/plugin";
import { useEffect, useState } from "react";

export function useCanvasRoot() {
  const [canvasRoot, setCanvasRoot] = useState<CanvasRootNode | null>(null);

  useEffect(() => {
    return framer.subscribeToCanvasRoot(setCanvasRoot);
  }, []);

  return canvasRoot;
}
