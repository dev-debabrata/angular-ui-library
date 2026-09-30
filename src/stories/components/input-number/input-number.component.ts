import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';

import { IconComponent } from '../icon/icon.component';

let nextId = 0;

@Component({
  selector: 'nex-input-number',
  imports: [NgTemplateOutlet, IconComponent],
  templateUrl: './input-number.html',
  styleUrl: './input-number.css',
})
export class InputNumberComponent {
  /** Numeric value (null when empty). Supports [(value)] two-way binding */
  readonly value = model<number | null>(null);

  /** Smallest allowed value. Negative numbers are blocked when this is 0 or more */
  readonly min = input<number>();

  /** Largest allowed value */
  readonly max = input<number>();

  /** Amount added/removed by the buttons and ArrowUp/ArrowDown */
  readonly step = input(1, { transform: numberAttribute });

  /** Show increment/decrement buttons? */
  readonly showButtons = input(false, { transform: booleanAttribute });

  /** Button placement: small arrows on the right, − input +, or + above and − below */
  readonly buttonLayout = input<'stacked' | 'horizontal' | 'vertical'>('stacked');

  /** Format style. In percent mode 25 is shown as 25% */
  readonly mode = input<'decimal' | 'currency' | 'percent'>('decimal');

  /** ISO 4217 currency code used in currency mode */
  readonly currency = input('USD');

  /** Locale for formatting, e.g. 'de-DE'. Defaults to the browser locale */
  readonly locale = input<string>();

  /** Minimum number of fraction digits shown */
  readonly minFractionDigits = input<number>();

  /** Maximum number of fraction digits allowed. 0 blocks the decimal separator */
  readonly maxFractionDigits = input<number>();

  /** Show thousands separators? */
  readonly useGrouping = input(true, { transform: booleanAttribute });

  /** Text shown before the formatted number, e.g. '$ ' */
  readonly prefix = input('');

  /** Text shown after the formatted number, e.g. ' kg' */
  readonly suffix = input('');

  /** Text shown when the input is empty */
  readonly placeholder = input('');

  /** Text shown above the input */
  readonly label = input('');

  /** Helper text shown under the input */
  readonly hint = input('');

  /** Is the input disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Is the input read-only? */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** Show a red border? */
  readonly invalid = input(false, { transform: booleanAttribute });

  protected readonly id = `input-number-${nextId++}`;
  protected readonly focused = signal(false);
  /** Raw text while editing (no grouping, prefix or suffix) */
  protected readonly draft = signal('');

  private readonly formatter = computed(
    () =>
      new Intl.NumberFormat(this.locale(), {
        style: this.mode(),
        currency: this.currency(),
        minimumFractionDigits: this.minFractionDigits(),
        maximumFractionDigits: this.maxFractionDigits(),
        useGrouping: this.useGrouping(),
      }),
  );

  private readonly fractionDigits = computed(
    () => this.formatter().resolvedOptions().maximumFractionDigits ?? 0,
  );

  private readonly separator = computed(
    () =>
      new Intl.NumberFormat(this.locale()).formatToParts(1.1).find((p) => p.type === 'decimal')
        ?.value ?? '.',
  );

  protected readonly display = computed(() => {
    const v = this.value();
    if (this.focused()) return this.draft();
    if (v == null) return '';
    return (
      this.prefix() +
      this.formatter().format(this.mode() === 'percent' ? v / 100 : v) +
      this.suffix()
    );
  });

  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopRepeat());
  }

  /** Can the value move one step in this direction (not locked and not at min/max)? */
  protected can(dir: number): boolean {
    const v = this.value();
    const bound = dir > 0 ? this.max() : this.min();
    return (
      !this.disabled() && !this.readonly() && (bound == null || v == null || dir * (v - bound) < 0)
    );
  }

  protected onFocus(): void {
    this.focused.set(true);
    this.draft.set(this.toRaw(this.value()));
  }

  protected onBlur(): void {
    this.commit();
    this.focused.set(false);
  }

  protected onKeydown(e: KeyboardEvent): void {
    const el = e.target as HTMLInputElement;
    const { key } = e;
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      e.preventDefault();
      this.spin(key === 'ArrowUp' ? 1 : -1);
    } else if (key === 'Enter') this.commit();
    else if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Printable key: only digits, one decimal separator and a leading minus get through
      const start = el.selectionStart ?? 0;
      const outside = el.value.slice(0, start) + el.value.slice(el.selectionEnd ?? 0);
      const ok =
        /\d/.test(key) ||
        ((key === '.' || key === this.separator()) &&
          this.fractionDigits() > 0 &&
          !/[.,]/.test(outside)) ||
        (key === '-' && (this.min() ?? -1) < 0 && start === 0 && !outside.includes('-'));
      if (!ok) e.preventDefault();
    }
  }

  protected onInput(e: Event): void {
    const { value } = e.target as HTMLInputElement;
    this.draft.set(value);
    this.value.set(this.parse(value));
  }

  protected onPaste(e: ClipboardEvent): void {
    e.preventDefault();
    const el = e.target as HTMLInputElement;
    const n = this.parse(e.clipboardData?.getData('text') ?? '', true);
    if (n == null) return;
    el.setRangeText(this.toRaw(n), el.selectionStart ?? 0, el.selectionEnd ?? 0, 'end');
    this.onInput(e);
  }

  /** Starts a button press: one step now, then repeat every 60ms after a 400ms hold */
  protected startRepeat(e: PointerEvent, dir: number): void {
    if (e.button !== 0) return;
    this.stopRepeat();
    const tick = (ms: number) => {
      if (this.spin(dir)) this.timer = setTimeout(() => tick(60), ms);
    };
    tick(400);
  }

  protected stopRepeat(): void {
    clearTimeout(this.timer);
  }

  /** Moves one step; returns false at a limit. Also used for keyboard clicks on the buttons */
  protected spin(dir: number): boolean {
    if (!this.can(dir)) return false;
    const base = this.value() ?? this.min() ?? 0;
    const next = this.clamp(Math.round((base + dir * this.step()) * 1e10) / 1e10);
    this.value.set(next);
    if (this.focused()) this.draft.set(this.toRaw(next));
    return true;
  }

  /** Clamps and rounds the current value */
  private commit(): void {
    const v = this.value();
    if (v == null) return this.draft.set('');
    const next = this.clamp(Number(v.toFixed(this.fractionDigits())));
    this.value.set(next);
    this.draft.set(this.toRaw(next));
  }

  private clamp(n: number): number {
    return Math.min(this.max() ?? Infinity, Math.max(this.min() ?? -Infinity, n));
  }

  /**
   * Extracts a number from text. Typed text uses '.' or the locale separator as decimal point;
   * pasted text (`loose`) may also contain grouping, currency symbols etc.
   */
  private parse(text: string, loose = false): number | null {
    const sep = this.separator();
    if (loose) text = text.split(sep === '.' ? ',' : '.').join('');
    const clean = text
      .replace(sep, '.')
      .replace(/[^\d.-]/g, '')
      .replace(/(?!^)-/g, '');
    const n = parseFloat(clean);
    return Number.isNaN(n) ? null : n;
  }

  private toRaw(n: number | null): string {
    return n == null ? '' : String(n).replace('.', this.separator());
  }
}
