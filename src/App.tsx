import { framer, CanvasNode, useIsAllowedTo } from "@framer/plugin";
import { useState, useEffect, useRef } from "react";
import "./App.css";

framer.showUI({
  position: "top left",
  width: 200,
  height: 200,
});

function useSelection() {
  const [selection, setSelection] = useState<CanvasNode[]>([]);

  useEffect(() => {
    return framer.subscribeToSelection(setSelection);
  }, []);

  return selection;
}

interface HistoryEntry {
  nodeId: string;
  nodeName: string;
  timestamp: number;
}

const MAX_HISTORY = 5;
const STORAGE_KEY = "contextPickerHistory";

function getNodeName(node: CanvasNode) {
  return "name" in node && node.name ? node.name : "Unknown";
}

function formatNodeAsJSON(node: CanvasNode): {
  nodeId: string;
  nodeName: string;
} {
  return {
    nodeId: node.id,
    nodeName: getNodeName(node),
  };
}

function formatSelectionAsJSON(selection: CanvasNode[]) {
  const formattedSelection = selection.map(formatNodeAsJSON);
  return JSON.stringify(
    formattedSelection.length === 1
      ? formattedSelection[0]
      : formattedSelection,
  );
}

async function copyTextToClipboard(
  text: string,
  clipboardField?: HTMLTextAreaElement | null,
) {
  if (clipboardField) {
    clipboardField.value = text;
    clipboardField.focus();
    clipboardField.select();

    try {
      if (document.execCommand("copy")) return true;
    } catch {
      // Continue to async clipboard fallback below.
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  }
}

export function App() {
  const selection = useSelection();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [justCopiedId, setJustCopiedId] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<
    "empty" | "copied" | "ready" | "failed"
  >("empty");
  const lastSelectionKeyRef = useRef("");
  const clipboardFieldRef = useRef<HTMLTextAreaElement>(null);
  const isAllowedtoSetPluginData = useIsAllowedTo("setPluginData");

  // Load history from plugin storage on mount
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

  // Persist history whenever it changes
  useEffect(() => {
    if (isAllowedtoSetPluginData) {
      framer.setPluginData(STORAGE_KEY, JSON.stringify(history));
    }
  }, [history, isAllowedtoSetPluginData]);

  // Auto-copy on every new selection, and push to history
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
      // de-duplicate by nodeId, keeping the most recent occurrence
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

  return (
    <main>
      <div className="instructions">
        <p>
          Select one or more nodes on canvas to copy their ID + name and paste to your
          external agent.
        </p>
      </div>

      <div className="status">
        {selection.length === 0 ? (
          <span className="status-empty">Nothing selected</span>
        ) : (
          <span className="status-active">
            {copyState === "copied" ? "Copied" : "Ready"} {selection.length}{" "}
            {selection.length === 1 ? "node" : "nodes"}
          </span>
        )}
      </div>

      <textarea
        ref={clipboardFieldRef}
        className="clipboard-field"
        readOnly
        aria-label="Selection JSON"
        onFocus={(event) => event.currentTarget.select()}
      />

      <div className="history">
        <div className="history-header">Recent</div>
        {history.length === 0 ? (
          <div className="history-empty">Selections will show up here</div>
        ) : (
          <ul className="history-list">
            {history.map((entry) => (
              <li
                className="history-item"
                key={`${entry.nodeId}-${entry.timestamp}`}
              >
                <span className="history-name" title={entry.nodeId}>
                  {entry.nodeName}
                </span>
                <button
                  className="copy-button"
                  onClick={() => handleCopyHistoryItem(entry)}
                  aria-label={`Copy ${entry.nodeName}`}
                >
                  {justCopiedId === entry.nodeId ? <CheckIcon /> : <CopyIcon />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect
        x="4"
        y="4"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M2.5 7.5H2A1 1 0 0 1 1 6.5V2A1 1 0 0 1 2 1H6.5A1 1 0 0 1 7.5 2V2.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 6.5L4.5 9L10 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
