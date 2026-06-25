import { framer, useIsAllowedTo } from "@framer/plugin";
import { useEffect, useRef, useState } from "react";
import { copyTextToClipboard } from "../lib/clipboard";
import { MAX_HISTORY, STATUS_CLEAR_MS, STORAGE_KEY } from "../lib/constants";
import { getNodeName } from "../lib/node";
import { formatSelectionAsJSON } from "../lib/selection";
import type { CopyState, HistoryEntry } from "../lib/types";
import { useSelection } from "./useSelection";

export function useContextPicker() {
  const selection = useSelection();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [justCopiedId, setJustCopiedId] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("empty");
  const [lastCopied, setLastCopied] = useState<Pick<
    HistoryEntry,
    "nodeId" | "nodeName"
  > | null>(null);
  const lastSelectionKeyRef = useRef("");
  const clipboardFieldRef = useRef<HTMLTextAreaElement>(null);
  const isAllowedtoSetPluginData = useIsAllowedTo("setPluginData");

  useEffect(() => {
    async function loadHistory() {
      const stored = await framer.getPluginData(STORAGE_KEY);
      if (stored) {
        try {
          setHistory(JSON.parse(stored));
        } catch {
          // ignore malformed stored data
        }
      }
    }
    loadHistory();
  }, []);

  useEffect(() => {
    if (isAllowedtoSetPluginData) {
      framer.setPluginData(STORAGE_KEY, JSON.stringify(history));
    }
  }, [history, isAllowedtoSetPluginData]);

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

    const selectionKey = selection.map((n) => n.id).join(",");
    if (selectionKey === lastSelectionKeyRef.current) return;
    lastSelectionKeyRef.current = selectionKey;

    const firstNode = selection[0];
    setLastCopied({
      nodeId: firstNode.id,
      nodeName: getNodeName(firstNode),
    });

    const json = formatSelectionAsJSON(selection);
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
      timestamp: Date.now(),
    }));

    setHistory((prev) => {
      const merged = [...entries.reverse(), ...prev];
      const seen = new Set<string>();
      const deduped = merged.filter((entry) => {
        if (seen.has(entry.nodeId)) return false;
        seen.add(entry.nodeId);
        return true;
      });
      return deduped.slice(0, MAX_HISTORY);
    });
  }, [selection]);

  async function handleCopyHistoryItem(entry: HistoryEntry) {
    const json = JSON.stringify({
      nodeId: entry.nodeId,
      nodeName: entry.nodeName,
    });
    const didCopy = await copyTextToClipboard(json, clipboardFieldRef.current);
    setLastCopied({ nodeId: entry.nodeId, nodeName: entry.nodeName });
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
