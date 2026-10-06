import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';
import type { FieldVariant } from '../../../utils/types';

@Component({
  selector: 'np-text-input',
  imports: [IconComponent],
  templateUrl: './text-input.html',
  styleUrl: './text-input.css',
})
export class TextInputComponent {
  /** Text shown above the input */
  readonly label = input('');

  /** HTML input type */
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'url'>('text');

  /** Text shown when the input is empty */
  readonly placeholder = input('');

  /** Input value. Supports [(value)] two-way binding */
  readonly value = model('');

  /** Helper text shown under the input */
  readonly hint = input('');

  /** Error text. Shows a red border when set */
  readonly error = input('');

  /** Mark the field as required? */
  readonly required = input(false, { transform: booleanAttribute });

  /** Is the input disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Accessible name when there is no visible label */
  readonly ariaLabel = input('');

  /** Field style: outlined, filled, underline or floating (label inside the field) */
  readonly variant = input<FieldVariant>('outlined');

  /** Icon file name shown at the start of the input (e.g. 'mail') */
  readonly icon = input('');

  /** Show a × button that clears the value while there is one? */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** Password shown as plain text (the eye button of type="password") */
  protected readonly revealed = signal(false);
  private readonly control = viewChild.required<ElementRef<HTMLInputElement>>('control');

  protected readonly isPassword = computed(() => this.type() === 'password');
  protected readonly inputType = computed(() =>
    this.isPassword() && this.revealed() ? 'text' : this.type(),
  );
  protected readonly showClear = computed(
    () => this.clearable() && !!this.value() && !this.disabled(),
  );
  /** Number of buttons at the end of the input, to pad the text clear of them */
  protected readonly actions = computed(() => +this.showClear() + +this.isPassword());

  protected clear(event: Event) {
    event.preventDefault();
    this.value.set('');
    this.control().nativeElement.focus();
  }

  protected toggleReveal(event: Event) {
    event.preventDefault();
    this.revealed.update((r) => !r);
  }
}
