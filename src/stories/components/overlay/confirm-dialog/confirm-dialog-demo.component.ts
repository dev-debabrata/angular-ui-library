import { Component, booleanAttribute, inject, input, signal } from '@angular/core';

import { ButtonComponent } from '../../form/button/button.component';
import { type Confirmation, ConfirmationService } from './confirmation.service';

/** A trigger button and the confirmation it opens */
export interface ConfirmDemoAction {
  label: string;
  primary?: boolean;
  options: Omit<Confirmation, 'accept' | 'reject' | 'target'>;
}

/**
 * Story-only helper: buttons that call ConfirmationService.confirm() and a line showing the result.
 * Used by the ConfirmDialog and ConfirmPopup stories. Not part of the library.
 */
@Component({
  selector: 'np-confirm-dialog-demo',
  imports: [ButtonComponent],
  templateUrl: './confirm-dialog-demo.html',
  styleUrl: './confirm-dialog-demo.css',
})
export class ConfirmDialogDemoComponent {
  /** Buttons to show */
  readonly actions = input<ConfirmDemoAction[]>([]);

  /** Anchor the confirmation to the clicked button (for <np-confirm-popup>) */
  readonly popup = input(false, { transform: booleanAttribute });

  private readonly service = inject(ConfirmationService);
  protected readonly status = signal('');

  protected open(action: ConfirmDemoAction, event: Event) {
    this.service.confirm({
      ...action.options,
      target: this.popup() ? event.currentTarget : null,
      accept: () => this.status.set(`${action.label}: accepted`),
      reject: () => this.status.set(`${action.label}: rejected`),
    });
  }
}
