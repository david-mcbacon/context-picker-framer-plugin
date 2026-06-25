import "./App.css";
import "./plugin/setup";
import { ClipboardField } from "./components/ClipboardField";
import { Footer } from "./components/Footer";
import { HistoryPanel } from "./components/HistoryPanel";
import { Instructions } from "./components/Instructions";
import { SelectionStatus } from "./components/SelectionStatus";
import { useContextPicker } from "./hooks/useContextPicker";

export function App() {
  const {
    history,
    copyState,
    lastCopied,
    justCopiedId,
    isSelectModeActive,
    clipboardFieldRef,
    handleToggleSelectMode,
    handleCopyHistoryItem,
  } = useContextPicker();

  return (
    <main>
      <Instructions />
      <SelectionStatus
        lastCopied={lastCopied}
        copyState={copyState}
        isSelectModeActive={isSelectModeActive}
        onToggleSelectMode={handleToggleSelectMode}
      />
      <ClipboardField fieldRef={clipboardFieldRef} />
      <HistoryPanel
        history={history}
        justCopiedId={justCopiedId}
        onCopyItem={handleCopyHistoryItem}
      />
      <Footer />
    </main>
  );
}
