import { framer, CanvasNode, useIsAllowedTo } from "@framer/plugin";
import { useState, useEffect } from "react";
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

function formatSelectionAsJSON(
  selection: { id: string; name: string | null }[],
): string {
  return selection
    .map(
      (node) =>
        `{"nodeId":"${node.id}","nodeName":"${node.name || "Unknown"}"}`,
    )
    .join(",");
}

export function App() {
  const selection = useSelection();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [justCopiedId, setJustCopiedId] = useState<string | null>(null);
  const [lastSelectionKey, setLastSelectionKey] = useState<string>("");
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
  }, [history]);

  // Auto-copy on every new selection, and push to history
  useEffect(() => {
    if (selection.length === 0) return;

    const selectionKey = selection.map((n) => n.id).join(",");
    if (selectionKey === lastSelectionKey) return;
    setLastSelectionKey(selectionKey);

    const json = formatSelectionAsJSON(selection);

    navigator.clipboard.writeText(json).catch(() => {
      // clipboard write can fail silently if focus isn't in the webview
    });

    const entries: HistoryEntry[] = selection.map((node) => ({
      nodeId: node.id,
      nodeName: node.name || "Unknown",
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
  }, [selection, lastSelectionKey]);

  async function handleCopyHistoryItem(entry: HistoryEntry) {
    const json = `{"nodeId":"${entry.nodeId}","nodeName":"${entry.nodeName}"}`;
    await navigator.clipboard.writeText(json);
    setJustCopiedId(entry.nodeId);
    setTimeout(() => setJustCopiedId(null), 1200);
  }

  return (
    <main>
      <div className="instructions">
        <p>
          Click a node on canvas to copy its ID + name and paste to your
          external agent.
        </p>
      </div>

      <div className="status">
        {selection.length === 0 ? (
          <span className="status-empty">Nothing selected</span>
        ) : (
          <span className="status-active">
            Copied {selection.length}{" "}
            {selection.length === 1 ? "node" : "nodes"}
          </span>
        )}
      </div>

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
