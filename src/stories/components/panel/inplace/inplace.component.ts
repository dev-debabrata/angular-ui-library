import {
  Component,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';

/** Looks of the display */
export const INPLACE_VARIANTS = ['default', 'underline', 'outlined', 'soft'] as const;
export type InplaceVariant = (typeof INPLACE_VARIANTS)[number];

/** Shows `[inplaceDisplay]` content until clicked, then swaps in `[inplaceContent]` (or a text box when `editable`) */
@Component({
  selector: 'np-inplace',
  imports: [IconComponent],
  templateUrl: './inplace.html',
  styleUrl: './inplace.css',
})
export class InplaceComponent {
  /** Is the content shown? Supports [(active)] two-way binding */
  readonly active = model(false);
  /** Show a close button to go back to the display? */
  readonly closable = input(false, { transform: booleanAttribute });
  /** Prevent activating? */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Look of the display: default, underline (dashed), outlined (dashed box) or soft (tinted) */
  readonly variant = input<InplaceVariant>('default');
  /** Icon after the display that brightens on hover, e.g. 'pencil' */
  readonly icon = input('');
  /** Built-in text editing: shows `value`, edits it in a text box with save (Enter) and cancel (Escape) */
  readonly editable = input(false, { transform: booleanAttribute });
  /** Text of an editable inplace. Supports [(value)] two-way binding */
  readonly value = model('');
  /** Shown when the editable value is empty */
  readonly placeholder = input('Click to edit');
  /** Emits when the content is shown */
  readonly activate = output<void>();
  /** Emits when the display is shown again */
  readonly deactivate = output<void>();

  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  /** Selects the text box when it opens (browser only) */
  protected readonly focusField = afterRenderEffect(() => this.field()?.nativeElement.select());

  protected open(event?: Event): void {
    event?.preventDefault();
    if (this.disabled() || this.active()) return;
    this.active.set(true);
    this.activate.emit();
  }

  protected close(text?: string): void {
    if (text !== undefined) this.value.set(text);
    this.active.set(false);
    this.deactivate.emit();
  }
}
