import {
  framer,
  isComponentNode,
  isDesignPageNode,
  isWebPageNode,
  useIsAllowedTo,
} from "@framer/plugin";
import { useEffect, useRef, useState } from "react";
import { copyTextToClipboard } from "../lib/clipboard";
import { MAX_HISTORY, STATUS_CLEAR_MS, STORAGE_KEY } from "../lib/constants";
import { getNodeName } from "../lib/node";
import { formatSelectionAsJSON } from "../lib/selection";
import type { CopyState, HistoryEntry, ScopeInfo } from "../lib/types";
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
    | "nodeId"
    | "nodeName"
    | "scopeType"
    | "scopeId"
    | "scopeName"
    | "urlPath"
    | "isReplica"
    | "originalNodeId"
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

    const scopeInfo = getScopeInfo(canvasRoot);
    const selectionKey = [
      selection.map((n) => n.id).join(","),
      scopeInfo?.scopeType ?? "",
      scopeInfo?.scopeId ?? "",
      scopeInfo?.scopeName ?? "",
      scopeInfo?.urlPath ?? "",
    ].join(":");
    if (selectionKey === lastSelectionKeyRef.current) return;
    lastSelectionKeyRef.current = selectionKey;

    const firstNode = selection[0];
    setLastCopied({
      nodeId: firstNode.id,
      nodeName: getNodeName(firstNode),
      ...scopeInfo,
      ...(firstNode.isReplica ? { isReplica: true } : {}),
      ...(firstNode.originalId ? { originalNodeId: firstNode.originalId } : {}),
    });

    const json = formatSelectionAsJSON(selection, scopeInfo);
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
      ...scopeInfo,
      ...(node.isReplica ? { isReplica: true } : {}),
      ...(node.originalId ? { originalNodeId: node.originalId } : {}),
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
      ...(entry.scopeType ? { scopeType: entry.scopeType } : {}),
      ...(entry.scopeId ? { scopeId: entry.scopeId } : {}),
      ...(entry.scopeName ? { scopeName: entry.scopeName } : {}),
      ...(entry.urlPath !== undefined ? { urlPath: entry.urlPath } : {}),
      ...(entry.isReplica ? { isReplica: true } : {}),
      ...(entry.originalNodeId
        ? { originalNodeId: entry.originalNodeId }
        : {}),
    });
    const didCopy = await copyTextToClipboard(json, clipboardFieldRef.current);
    setLastCopied({
      nodeId: entry.nodeId,
      nodeName: entry.nodeName,
      scopeType: entry.scopeType,
      scopeId: entry.scopeId,
      scopeName: entry.scopeName,
      urlPath: entry.urlPath,
      isReplica: entry.isReplica,
      originalNodeId: entry.originalNodeId,
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

function getScopeInfo(
  canvasRoot: ReturnType<typeof useCanvasRoot>,
): ScopeInfo | null {
  if (canvasRoot === null) return null;

  if (isWebPageNode(canvasRoot)) {
    return {
      scopeType: "WebPageNode",
      scopeId: canvasRoot.id,
      urlPath: canvasRoot.path,
    };
  }

  if (isDesignPageNode(canvasRoot)) {
    return {
      scopeType: "DesignPageNode",
      scopeId: canvasRoot.id,
      ...(canvasRoot.name ? { scopeName: canvasRoot.name } : {}),
      urlPath: null,
    };
  }

  if (isComponentNode(canvasRoot)) {
    return {
      scopeType: "ComponentNode",
      scopeId: canvasRoot.id,
      ...(canvasRoot.componentName
        ? { scopeName: canvasRoot.componentName }
        : {}),
      urlPath: null,
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
