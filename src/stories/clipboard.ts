/** Clipboard API with a fallback for browsers/iframes where it is blocked */
export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = Object.assign(document.createElement('textarea'), { value: text });
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}
