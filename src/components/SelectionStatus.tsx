import type { CanvasNode } from "@framer/plugin";
import { getNodeName } from "../lib/node";
import type { CopyState } from "../lib/types";
import { CheckIcon } from "./icons/CheckIcon";

interface SelectionStatusProps {
  selection: CanvasNode[];
  copyState: CopyState;
}

export function SelectionStatus({ selection, copyState }: SelectionStatusProps) {
  return (
    <div className="status">
      {selection.length === 0 ? (
        <span className="status-empty">Nothing selected</span>
      ) : (
        <span className="status-active" title={getNodeName(selection[0])}>
          {copyState === "copied" && (
            <span className="status-check" aria-hidden="true">
              <CheckIcon />
            </span>
          )}
          <span className="status-label">
            {copyState === "copied" ? "Copied:" : "Ready:"}{" "}
            {getNodeName(selection[0])}
          </span>
        </span>
      )}
    </div>
  );
}
