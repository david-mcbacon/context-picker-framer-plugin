export async function copyTextToClipboard(
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
