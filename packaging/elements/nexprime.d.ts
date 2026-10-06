/** nexprime-ui/elements: importing it registers every NexPrime component as an <np-*> Web Component */
export {};

/** Options for window.NexPrime.confirm() */
export interface Confirmation {
  message: string;
  header?: string;
  /** Icon file name, e.g. 'triangle-alert' */
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  /** Color of the accept button */
  acceptTone?: 'primary' | 'danger';
  /** Element to anchor to. Set it for <np-confirm-popup>, leave it empty for <np-confirm-dialog> */
  target?: EventTarget | null;
  accept?: () => void;
  reject?: () => void;
  /** Only a dialog/popup with the same key responds */
  key?: string;
}

declare global {
  interface Window {
    /** Where <np-icon> loads its SVG files from (default 'icons/' next to the page) */
    NEXPRIME_ICONS_URL?: string;
    /** Imperative API for things that are services in Angular */
    NexPrime: { confirm(options: Confirmation): void; close(): void };
  }
}
