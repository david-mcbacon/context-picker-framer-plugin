import "./App.css";
import "./plugin/setup";
import { ClipboardField } from "./components/ClipboardField";
import { HistoryPanel } from "./components/HistoryPanel";
import { Instructions } from "./components/Instructions";
import { SelectionStatus } from "./components/SelectionStatus";
import { useContextPicker } from "./hooks/useContextPicker";

export function App() {
  const {
    selection,
    history,
    copyState,
    justCopiedId,
    clipboardFieldRef,
    handleCopyHistoryItem,
  } = useContextPicker();

  return (
    <main>
      <Instructions />
      <SelectionStatus selection={selection} copyState={copyState} />
      <ClipboardField fieldRef={clipboardFieldRef} />
      <HistoryPanel
        history={history}
        justCopiedId={justCopiedId}
        onCopyItem={handleCopyHistoryItem}
      />
    </main>
  );
}
