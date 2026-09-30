import { Component, booleanAttribute, input, model } from '@angular/core';

@Component({
  selector: 'nex-checkbox',
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.css',
})
export class CheckboxComponent {
  /** Text next to the checkbox */
  readonly label = input('');

  /** Is the checkbox checked? Supports [(checked)] two-way binding */
  readonly checked = model(false);

  /** Is the checkbox disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });
}
