import { useEffect, useMemo, useState } from "react";
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
  const incomingStatus = useMemo(
    () => ({
      copyState,
      lastCopied,
      key:
        lastCopied === null
          ? "empty"
          : `${copyState}-${lastCopied.nodeId}-${lastCopied.nodeName}`,
    }),
    [copyState, lastCopied],
  );
  const [visibleStatus, setVisibleStatus] = useState(incomingStatus);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (incomingStatus.key === visibleStatus.key) return;

    setIsChanging(true);

    const swapTimeout = window.setTimeout(() => {
      setVisibleStatus(incomingStatus);
      window.requestAnimationFrame(() => setIsChanging(false));
    }, 60);

    return () => window.clearTimeout(swapTimeout);
  }, [incomingStatus, visibleStatus.key]);

  const displayedLastCopied = visibleStatus.lastCopied;
  const displayedCopyState = visibleStatus.copyState;

  return (
    <div className="status">
      {displayedLastCopied === null ? (
        <span
          className={`status-content status-empty${
            isChanging ? " status-content--changing" : ""
          }`}
        >
          Nothing selected
        </span>
      ) : (
        <span
          className={`status-content status-active${
            isChanging ? " status-content--changing" : ""
          }`}
          title={displayedLastCopied.nodeName}
        >
          {displayedCopyState === "copied" && (
            <span className="status-check" aria-hidden="true">
              <CheckIcon />
            </span>
          )}
          <span className="status-label">
            {displayedCopyState === "copied" ? "Copied:" : "Ready:"}{" "}
            {displayedLastCopied.nodeName}
          </span>
        </span>
      )}
    </div>
  );
}
