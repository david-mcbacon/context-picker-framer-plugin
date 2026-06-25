import {
  framer,
  isDesignPageNode,
  isWebPageNode,
  useIsAllowedTo,
} from "@framer/plugin";
import { useEffect, useRef, useState } from "react";
import { copyTextToClipboard } from "../lib/clipboard";
import { MAX_HISTORY, STATUS_CLEAR_MS, STORAGE_KEY } from "../lib/constants";
import { getNodeName } from "../lib/node";
import { formatSelectionAsJSON } from "../lib/selection";
import type { CopyState, HistoryEntry, PageInfo } from "../lib/types";
import { useCanvasRoot } from "./useCanvasRoot";
import { useSelection } from "./useSelection";

export function useContextPicker() {
  const selection = useSelection();
  const canvasRoot = useCanvasRoot();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [justCopiedId, setJustCopiedId] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("empty");
  const [lastCopied, setLastCopied] = useState<Pick<
    HistoryEntry,
    "nodeId" | "nodeName" | "pageType" | "pageId" | "pagePath"
  > | null>(null);
  const lastSelectionKeyRef = useRef("");
  const clipboardFieldRef = useRef<HTMLTextAreaElement>(null);
  const isAllowedtoSetPluginData = useIsAllowedTo("setPluginData");

  useEffect(() => {
    async function loadHistory() {
      try {
        const stored = await framer.getPluginData(STORAGE_KEY);
        if (stored) {
          const storedHistory = JSON.parse(stored);
          if (Array.isArray(storedHistory)) {
            setHistory((current) =>
              mergeHistory(storedHistory as HistoryEntry[], current),
            );
          }
        }
      } catch {
        // ignore malformed or unavailable stored data
      } finally {
        setHasLoadedHistory(true);
      }
    }
    loadHistory();
  }, []);

  useEffect(() => {
    if (hasLoadedHistory && isAllowedtoSetPluginData) {
      framer.setPluginData(STORAGE_KEY, JSON.stringify(history));
    }
  }, [history, hasLoadedHistory, isAllowedtoSetPluginData]);

  useEffect(() => {
    if (lastCopied === null) return;

    const timeout = setTimeout(() => {
      setLastCopied(null);
      setCopyState("empty");
    }, STATUS_CLEAR_MS);

    return () => clearTimeout(timeout);
  }, [lastCopied]);

  useEffect(() => {
    if (selection.length === 0) {
      lastSelectionKeyRef.current = "";
      return;
    }

    const pageInfo = getPageInfo(canvasRoot);
    const selectionKey = [
      selection.map((n) => n.id).join(","),
      pageInfo?.pageType ?? "",
      pageInfo?.pageId ?? "",
      pageInfo?.pagePath ?? "",
    ].join(":");
    if (selectionKey === lastSelectionKeyRef.current) return;
    lastSelectionKeyRef.current = selectionKey;

    const firstNode = selection[0];
    setLastCopied({
      nodeId: firstNode.id,
      nodeName: getNodeName(firstNode),
      ...pageInfo,
    });

    const json = formatSelectionAsJSON(selection, pageInfo);
    setCopyState("ready");

    requestAnimationFrame(() => {
      void copyTextToClipboard(json, clipboardFieldRef.current).then(
        (didCopy) => {
          setCopyState(didCopy ? "copied" : "ready");
        },
      );
    });

    const entries: HistoryEntry[] = selection.map((node) => ({
      nodeId: node.id,
      nodeName: getNodeName(node),
      ...pageInfo,
      timestamp: Date.now(),
    }));

    setHistory((prev) => {
      return mergeHistory(entries.reverse(), prev);
    });
  }, [selection, canvasRoot]);

  async function handleCopyHistoryItem(entry: HistoryEntry) {
    const json = JSON.stringify({
      nodeId: entry.nodeId,
      nodeName: entry.nodeName,
      ...(entry.pageType ? { pageType: entry.pageType } : {}),
      ...(entry.pageId ? { pageId: entry.pageId } : {}),
      ...(entry.pagePath ? { pagePath: entry.pagePath } : {}),
    });
    const didCopy = await copyTextToClipboard(json, clipboardFieldRef.current);
    setLastCopied({
      nodeId: entry.nodeId,
      nodeName: entry.nodeName,
      pageType: entry.pageType,
      pageId: entry.pageId,
      pagePath: entry.pagePath,
    });
    setCopyState(didCopy ? "copied" : "ready");
    setJustCopiedId(entry.nodeId);
    setTimeout(() => setJustCopiedId(null), 1200);
  }

  return {
    history,
    copyState,
    lastCopied,
    justCopiedId,
    clipboardFieldRef,
    handleCopyHistoryItem,
  };
}

function getPageInfo(
  canvasRoot: ReturnType<typeof useCanvasRoot>,
): PageInfo | null {
  if (canvasRoot === null) return null;

  if (isWebPageNode(canvasRoot)) {
    return {
      pageType: "web page",
      pageId: canvasRoot.id,
      ...(canvasRoot.path ? { pagePath: canvasRoot.path } : {}),
    };
  }

  if (isDesignPageNode(canvasRoot)) {
    return {
      pageType: "design page",
      pageId: canvasRoot.id,
    };
  }

  return null;
}

function mergeHistory(
  primary: HistoryEntry[],
  secondary: HistoryEntry[],
): HistoryEntry[] {
  const seen = new Set<string>();

  return [...primary, ...secondary]
    .filter((entry) => {
      if (typeof entry?.nodeId !== "string") return false;
      if (seen.has(entry.nodeId)) return false;
      seen.add(entry.nodeId);
      return true;
    })
    .slice(0, MAX_HISTORY);
}
