import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  linkedSignal,
  viewChild,
} from '@angular/core';

import { TONE_ICONS } from '../../../utils/types';
import { type DialogVariant, DialogComponent } from '../dialog/dialog.component';
import { IconComponent } from '../../media/icon/icon.component';
import { ConfirmationService } from './confirmation.service';

@Component({
  selector: 'np-confirm-dialog',
  imports: [DialogComponent, IconComponent],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialogComponent {
  /** Only respond to confirm() calls with the same key */
  readonly key = input<string>();
  /** Look of the dialog (see Dialog): default, glass, gradient, aurora or hero (centered, big icon) */
  readonly variant = input<DialogVariant>('default');

  private readonly service = inject(ConfirmationService);
  private readonly acceptButton = viewChild<ElementRef<HTMLButtonElement>>('acceptButton');
  private readonly confirmInput = viewChild<ElementRef<HTMLInputElement>>('confirmInput');
  protected readonly icons = TONE_ICONS;

  /** Active confirmation meant for this dialog: no target and a matching key */
  protected readonly confirmation = computed(() => {
    const c = this.service.confirmation();
    return c && !c.target && c.key === this.key() ? c : null;
  });

  /** What the user typed for confirmText; cleared for each confirmation */
  protected readonly typed = linkedSignal({ source: this.confirmation, computation: () => '' });

  constructor() {
    // After render, so it runs once the dialog has projected the button (and focused its panel)
    afterRenderEffect(() => (this.confirmInput() ?? this.acceptButton())?.nativeElement.focus());
  }

  protected accept() {
    if (this.confirmation()) this.service.accept();
  }

  /** Also called when the dialog closes itself: ×, Escape or a backdrop click */
  protected reject() {
    if (this.confirmation()) this.service.reject();
  }
}
