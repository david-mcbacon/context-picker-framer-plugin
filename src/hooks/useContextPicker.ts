import { framer, useIsAllowedTo } from "@framer/plugin";
import { useEffect, useRef, useState } from "react";
import { copyTextToClipboard } from "../lib/clipboard";
import { MAX_HISTORY, STORAGE_KEY } from "../lib/constants";
import { getNodeName } from "../lib/node";
import { formatSelectionAsJSON } from "../lib/selection";
import type { CopyState, HistoryEntry } from "../lib/types";
import { useSelection } from "./useSelection";

export function useContextPicker() {
  const selection = useSelection();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [justCopiedId, setJustCopiedId] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("empty");
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
    if (selection.length === 0) {
      lastSelectionKeyRef.current = "";
      setCopyState("empty");
      return;
    }

    const selectionKey = selection.map((n) => n.id).join(",");
    if (selectionKey === lastSelectionKeyRef.current) return;
    lastSelectionKeyRef.current = selectionKey;

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
    await copyTextToClipboard(json, clipboardFieldRef.current);
    setJustCopiedId(entry.nodeId);
    setTimeout(() => setJustCopiedId(null), 1200);
  }

  return {
    selection,
    history,
    copyState,
    justCopiedId,
    clipboardFieldRef,
    handleCopyHistoryItem,
  };
}
