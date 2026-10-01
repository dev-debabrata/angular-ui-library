/** Saves a Blob as a file download (used by the Icons and NexLottie pages) */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: filename }).click();
  // Revoking right away can cancel the download in some browsers
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
