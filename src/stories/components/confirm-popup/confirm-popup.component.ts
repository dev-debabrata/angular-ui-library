import {
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { ConfirmationService } from '../confirm-dialog/confirmation.service';
import { IconComponent } from '../icon/icon.component';
import { type AnchorPosition, anchorPosition } from '../../anchor-position';

let nextId = 0;

@Component({
  selector: 'nex-confirm-popup',
  imports: [IconComponent],
  host: {
    '(document:keydown.escape)': 'reject()',
    '(document:click)': 'onDocumentClick($event)',
    '(window:resize)': 'reposition()',
    '(window:scroll)': 'reposition()',
  },
  templateUrl: './confirm-popup.html',
  styleUrl: './confirm-popup.css',
})
export class ConfirmPopupComponent {
  /** Only respond to confirm() calls with the same key */
  readonly key = input<string>();

  private readonly service = inject(ConfirmationService);
  private readonly popup = viewChild<ElementRef<HTMLElement>>('popup');
  private readonly acceptButton = viewChild<ElementRef<HTMLButtonElement>>('acceptButton');
  protected readonly id = `nex-confirm-popup-${nextId++}`;
  protected readonly position = signal<AnchorPosition | null>(null);

  /** Active confirmation meant for this popup: has a target element and a matching key */
  protected readonly confirmation = computed(() => {
    const c = this.service.confirmation();
    return c && c.target instanceof Element && c.key === this.key() ? c : null;
  });

  constructor() {
    // Measure and place the popup whenever it opens or moves to a new target
    effect(() => {
      this.confirmation();
      this.position.set(null);
      if (this.popup()) {
        this.reposition();
        this.acceptButton()?.nativeElement.focus({ preventScroll: true });
      }
    });
  }

  protected reposition() {
    const target = this.confirmation()?.target;
    const popup = this.popup()?.nativeElement;
    if (target instanceof Element && popup) this.position.set(anchorPosition(target, popup));
  }

  protected accept() {
    if (this.confirmation()) this.service.accept();
  }

  protected reject() {
    if (this.confirmation()) this.service.reject();
  }

  /** Clicks outside the popup and its target reject the confirmation */
  protected onDocumentClick(event: Event) {
    const target = this.confirmation()?.target as Element | undefined;
    const node = event.target as Node;
    if (target && !target.contains(node) && !this.popup()?.nativeElement.contains(node))
      this.reject();
  }
}
