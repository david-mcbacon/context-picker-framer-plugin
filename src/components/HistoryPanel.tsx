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
              role="button"
              tabIndex={0}
              aria-label={`Copy ${entry.nodeName}`}
              onClick={() => onCopyItem(entry)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onCopyItem(entry);
                }
              }}
            >
              <span className="history-name" title={entry.nodeId}>
                {entry.nodeName}
              </span>
              <span
                className={`history-copy-icon${
                  justCopiedId === entry.nodeId
                    ? " history-copy-icon--success"
                    : ""
                }`}
                aria-hidden="true"
              >
                <span
                  className={`history-icon-layer${
                    justCopiedId === entry.nodeId
                      ? ""
                      : " history-icon-layer--visible"
                  }`}
                >
                  <CopyIcon />
                </span>
                <span
                  className={`history-icon-layer${
                    justCopiedId === entry.nodeId
                      ? " history-icon-layer--visible"
                      : ""
                  }`}
                >
                  <CheckIcon width={24} height={24} />
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
