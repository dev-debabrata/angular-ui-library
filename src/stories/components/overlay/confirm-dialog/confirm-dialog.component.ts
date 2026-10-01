import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';

import { DialogComponent } from '../dialog/dialog.component';
import { IconComponent } from '../../media/icon/icon.component';
import { ConfirmationService } from './confirmation.service';

@Component({
  selector: 'nex-confirm-dialog',
  imports: [DialogComponent, IconComponent],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialogComponent {
  /** Only respond to confirm() calls with the same key */
  readonly key = input<string>();

  private readonly service = inject(ConfirmationService);
  private readonly acceptButton = viewChild<ElementRef<HTMLButtonElement>>('acceptButton');

  /** Active confirmation meant for this dialog: no target and a matching key */
  protected readonly confirmation = computed(() => {
    const c = this.service.confirmation();
    return c && !c.target && c.key === this.key() ? c : null;
  });

  constructor() {
    // After render, so it runs once the dialog has projected the button (and focused its panel)
    afterRenderEffect(() => this.acceptButton()?.nativeElement.focus());
  }

  protected accept() {
    if (this.confirmation()) this.service.accept();
  }

  /** Also called when the dialog closes itself: ×, Escape or a backdrop click */
  protected reject() {
    if (this.confirmation()) this.service.reject();
  }
}
