import { Component, booleanAttribute, input, model } from '@angular/core';

@Component({
  selector: 'np-text-input',
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
}
