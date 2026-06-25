import type { HistoryEntry } from "../lib/types";
import { CheckIcon } from "./icons/CheckIcon";
import { CopyIcon } from "./icons/CopyIcon";

interface HistoryPanelProps {
  history: HistoryEntry[];
  justCopiedId: string | null;
  onCopyItem: (entry: HistoryEntry) => void;
}

export function HistoryPanel({
  history,
  justCopiedId,
  onCopyItem,
}: HistoryPanelProps) {
  return (
    <div className="history">
      <div className="history-header">Recent selections</div>
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
                onClick={() => onCopyItem(entry)}
                aria-label={`Copy ${entry.nodeName}`}
              >
                {justCopiedId === entry.nodeId ? <CheckIcon /> : <CopyIcon />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
