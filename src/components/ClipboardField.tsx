import { type RefObject } from "react";

interface ClipboardFieldProps {
  fieldRef: RefObject<HTMLTextAreaElement>;
}

export function ClipboardField({ fieldRef }: ClipboardFieldProps) {
  return (
    <textarea
      ref={fieldRef}
      className="clipboard-field"
      readOnly
      aria-label="Selection JSON"
      onFocus={(event) => event.currentTarget.select()}
    />
  );
}
