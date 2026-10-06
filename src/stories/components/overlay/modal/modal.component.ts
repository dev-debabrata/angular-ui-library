import { Component, booleanAttribute, input, model } from '@angular/core';

/** Looks of the modal */
export const MODAL_VARIANTS = ['default', 'glass', 'gradient', 'sheet'] as const;
export type ModalVariant = (typeof MODAL_VARIANTS)[number];

/** Widths of the modal; full covers the screen */
export const MODAL_SIZES = ['small', 'medium', 'large', 'full'] as const;
export type ModalSize = (typeof MODAL_SIZES)[number];

@Component({
  selector: 'np-modal',
  host: {
    '(document:keydown.escape)': 'closeOnEscape() && close()',
  },
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class ModalComponent {
  /** Is the modal visible? Supports [(open)] two-way binding */
  readonly open = model(false);

  /** Heading shown at the top of the modal */
  readonly title = input('');

  /** Look: default, glass (frosted), gradient (glowing gradient border) or sheet (slides up from the bottom) */
  readonly variant = input<ModalVariant>('default');
  /** Width: small (360px), medium (480px), large (720px) or full (the whole screen) */
  readonly size = input<ModalSize>('medium');
  /** Close when the backdrop is clicked */
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });
  /** Close when Escape is pressed */
  readonly closeOnEscape = input(true, { transform: booleanAttribute });

  close() {
    this.open.set(false);
  }
}
