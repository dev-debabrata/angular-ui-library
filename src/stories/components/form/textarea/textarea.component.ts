import {
  Component,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  input,
  model,
  numberAttribute,
  viewChild,
} from '@angular/core';

import type { FieldVariant } from '../../../utils/types';

@Component({
  selector: 'np-textarea',
  templateUrl: './textarea.html',
  styleUrl: './textarea.css',
})
export class TextareaComponent {
  /** Text shown above the textarea */
  readonly label = input('');

  /** Text shown when the textarea is empty */
  readonly placeholder = input('');

  /** Textarea value. Supports [(value)] two-way binding */
  readonly value = model('');

  /** Visible number of lines */
  readonly rows = input(4, { transform: numberAttribute });

  /** Maximum number of characters. Shows a counter when set */
  readonly maxLength = input(0, { transform: numberAttribute });

  /** Is the textarea disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Field style: outlined, filled, underline or floating (label inside the field) */
  readonly variant = input<FieldVariant>('outlined');

  /** Grow with the content instead of scrolling (`rows` is the minimum height) */
  readonly autoResize = input(false, { transform: booleanAttribute });

  private readonly control = viewChild.required<ElementRef<HTMLTextAreaElement>>('control');

  constructor() {
    // Fit a starting value (browser only)
    afterNextRender(() => this.resize());
  }

  protected onInput(event: Event) {
    this.value.set((event.target as HTMLTextAreaElement).value);
    this.resize();
  }

  /** Auto-resize: set the height to the content's (plus borders), never below `rows` */
  private resize() {
    if (!this.autoResize()) return;
    const el = this.control().nativeElement;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
  }
}
