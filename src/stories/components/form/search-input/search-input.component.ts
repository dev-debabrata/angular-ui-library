import {
  Component,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';
import type { FieldVariant } from '../../../utils/types';

let nextId = 0;

@Component({
  selector: 'np-search-input',
  imports: [IconComponent],
  host: { '(document:keydown)': 'onDocumentKeydown($event)' },
  templateUrl: './search-input.html',
  styleUrl: './search-input.css',
})
export class SearchInputComponent {
  /** Text shown when the input is empty */
  readonly placeholder = input('Search...');

  /** Initial value of the input */
  readonly value = input('');

  /** Is the input disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Text shown above the input (inside it with variant floating). Without it, the placeholder names the input */
  readonly label = input('');

  /** Field style: outlined, filled, underline or floating (label inside the field) */
  readonly variant = input<FieldVariant>('outlined');

  /** Show a spinner in place of the search icon (e.g. while results load)? */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Key that focuses the input from anywhere on the page: a letter means Ctrl/⌘ + letter ('k'), other keys alone ('/') */
  readonly shortcut = input('');

  /**
   * Emits the current text on every keystroke, and '' when cleared (× or Escape). The input's native `search`
   * event has the same name and bubbles, so the template stops it: listeners get only this output's text
   */
  readonly search = output<string>();

  protected readonly id = `np-search-input-${nextId++}`;
  /** Current text: starts at `value`, then follows typing */
  protected readonly text = linkedSignal(() => this.value());
  /** Show ⌘ instead of Ctrl (set in the browser) */
  private readonly mac = signal(false);
  private readonly control = viewChild.required<ElementRef<HTMLInputElement>>('control');

  /** A letter shortcut needs Ctrl/⌘ */
  private readonly modified = computed(() => /^[a-z]$/i.test(this.shortcut()));
  /** The shortcut as shown in the field, e.g. "/", "⌘ K" or "Ctrl K" */
  protected readonly shortcutLabel = computed(() => {
    const key = this.shortcut();
    if (!this.modified()) return key;
    return `${this.mac() ? '⌘' : 'Ctrl'} ${key.toUpperCase()}`;
  });

  /** aria-keyshortcuts value, e.g. "/" or "Control+K Meta+K" */
  protected readonly keyshortcuts = computed(() => {
    const key = this.shortcut();
    if (!key) return null;
    return this.modified() ? `Control+${key.toUpperCase()} Meta+${key.toUpperCase()}` : key;
  });

  constructor() {
    afterNextRender(() => this.mac.set(/Mac|iPhone|iPad/.test(navigator.platform)));
  }

  protected onInput(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    this.text.set(text);
    this.search.emit(text);
  }

  /** × button and Escape: empty the input and keep focus in it */
  protected clear() {
    if (!this.text()) return;
    this.text.set('');
    this.search.emit('');
    this.control().nativeElement.focus();
  }

  protected onEscape(event: Event) {
    if (!this.text()) return;
    event.preventDefault();
    this.clear();
  }

  /** The shortcut focuses the input, unless the user is typing in another field */
  protected onDocumentKeydown(event: KeyboardEvent) {
    const key = this.shortcut();
    if (!key || this.disabled() || event.defaultPrevented || event.altKey) return;
    const modifier = event.ctrlKey || event.metaKey;
    if (event.key.toLowerCase() !== key.toLowerCase() || modifier !== this.modified()) return;
    const target = event.target as HTMLElement | null;
    if (
      target?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])')
    )
      return;
    event.preventDefault();
    const input = this.control().nativeElement;
    input.focus();
    input.select();
  }
}
