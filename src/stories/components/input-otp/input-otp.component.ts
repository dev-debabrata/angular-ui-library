import {
  Component,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  viewChildren,
} from '@angular/core';

import { Size } from '../../types';

let nextId = 0;

@Component({
  selector: 'nex-input-otp',
  templateUrl: './input-otp.html',
  styleUrl: './input-otp.css',
})
export class InputOtpComponent {
  /** Entered code. Supports [(value)] two-way binding */
  readonly value = model('');

  /** Number of boxes (characters in the code) */
  readonly length = input(4, { transform: numberAttribute });

  /** Accept digits only and show the numeric keyboard on mobile? */
  readonly integerOnly = input(false, { transform: booleanAttribute });

  /** Hide the characters like a password field? */
  readonly mask = input(false, { transform: booleanAttribute });

  /** Box size */
  readonly size = input<Size>('medium');

  /** 'box': bordered squares. 'underline': a line under each character */
  readonly variant = input<'box' | 'underline'>('box');

  /** Is the input disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Show a red border on every box? */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** Focus the first box when the component is rendered? */
  readonly autofocus = input(false, { transform: booleanAttribute });

  /** Zero-based box indexes after which a dash is shown, e.g. [2] for a 3-3 code */
  readonly separatorAfter = input<number[]>([]);

  /** Text shown above the boxes */
  readonly label = input('');

  /** Helper text shown under the boxes */
  readonly hint = input('');

  /** Emits the full code when every box is filled */
  readonly complete = output<string>();

  protected readonly id = `input-otp-${nextId++}`;
  protected readonly boxes = viewChildren<ElementRef<HTMLInputElement>>('box');

  /** One entry per box. Keeps empty gaps while typing, resets when value/length change from outside */
  protected readonly chars = linkedSignal<{ v: string; n: number }, string[]>({
    source: () => ({ v: this.value(), n: this.length() }),
    computation: ({ v, n }, prev) =>
      prev && prev.value.length === n && prev.value.join('') === v
        ? prev.value
        : Array.from({ length: n }, (_, i) => v[i] ?? ''),
  });

  constructor() {
    afterNextRender(() => this.autofocus() && this.focus(0));
  }

  protected onKeydown(e: KeyboardEvent, i: number): void {
    const { key } = e;
    const moves: Record<string, number> = {
      ArrowLeft: i - 1,
      ArrowRight: i + 1,
      Home: 0,
      End: this.length() - 1,
    };
    const move = moves[key];
    const printable = key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
    if (move == null && !printable && key !== 'Backspace' && key !== 'Delete') return;
    e.preventDefault();
    if (move != null) this.focus(move);
    // Printable key: replace this box and move on (invalid keys are ignored)
    else if (printable) this.fill(i, this.filter(key));
    else {
      // Backspace on an empty box clears and focuses the previous one
      const t = key === 'Backspace' && !this.chars()[i] ? i - 1 : i;
      if (t < 0) return;
      this.write(t, ['']);
      this.focus(t);
    }
  }

  /** Fallback for mobile keyboards / autofill that bypass keydown */
  protected onInput(e: Event, i: number): void {
    const el = e.target as HTMLInputElement;
    const text = this.filter(el.value);
    el.value = this.chars()[i];
    this.fill(i, text);
  }

  protected onPaste(e: ClipboardEvent, i: number): void {
    e.preventDefault();
    const text = this.filter(e.clipboardData?.getData('text') ?? '');
    this.fill(text.length >= this.length() ? 0 : i, text);
  }

  /** Writes text into consecutive boxes starting at `from`, then focuses the box after it */
  private fill(from: number, text: string): void {
    if (!text) return;
    const written = text.slice(0, this.length() - from).split('');
    this.write(from, written);
    this.focus(from + written.length);
  }

  private write(from: number, parts: string[]): void {
    const chars = [...this.chars()];
    chars.splice(from, parts.length, ...parts);
    this.chars.set(chars);
    this.value.set(chars.join(''));
    if (chars.every(Boolean)) this.complete.emit(this.value());
  }

  private filter(text: string): string {
    return text.replace(this.integerOnly() ? /\D/g : /\s/g, '');
  }

  private focus(i: number): void {
    this.boxes()[Math.max(0, Math.min(i, this.length() - 1))]?.nativeElement.focus();
  }
}
