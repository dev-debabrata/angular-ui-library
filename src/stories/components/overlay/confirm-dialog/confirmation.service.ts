import { Injectable, signal } from '@angular/core';

/** Options for ConfirmationService.confirm() */
export interface Confirmation {
  message: string;
  header?: string;
  /** Icon file name from src/stories/icons/svg */
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

/** Opens <np-confirm-dialog> and <np-confirm-popup>. Only one confirmation is active at a time */
@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  private readonly active = signal<Confirmation | null>(null);

  /** The confirmation currently shown, or null */
  readonly confirmation = this.active.asReadonly();

  /** Show a confirmation, replacing any open one */
  confirm(options: Confirmation) {
    this.active.set(options);
    return this;
  }

  /** Hide the confirmation without calling accept or reject */
  close() {
    this.active.set(null);
  }

  /** Hide the confirmation and call its accept callback */
  accept() {
    const current = this.active();
    this.close();
    current?.accept?.();
  }

  /** Hide the confirmation and call its reject callback */
  reject() {
    const current = this.active();
    this.close();
    current?.reject?.();
  }
}
