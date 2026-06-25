import type { CopyState, HistoryEntry } from "../lib/types";
import { CheckIcon } from "./icons/CheckIcon";

interface SelectionStatusProps {
  lastCopied: Pick<HistoryEntry, "nodeId" | "nodeName"> | null;
  copyState: CopyState;
}

export function SelectionStatus({
  lastCopied,
  copyState,
}: SelectionStatusProps) {
  return (
    <div className="status">
      {lastCopied === null ? (
        <span className="status-empty">Nothing selected</span>
      ) : (
        <span className="status-active" title={lastCopied.nodeName}>
          {copyState === "copied" && (
            <span className="status-check" aria-hidden="true">
              <CheckIcon />
            </span>
          )}
          <span className="status-label">
            {copyState === "copied" ? "Copied:" : "Ready:"}{" "}
            {lastCopied.nodeName}
          </span>
        </span>
      )}
    </div>
  );
}
