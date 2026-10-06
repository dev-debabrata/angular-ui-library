import { Component, booleanAttribute, input, model } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'np-select',
  templateUrl: './select.html',
  styleUrl: './select.css',
})
export class SelectComponent {
  /** Text shown above the dropdown */
  readonly label = input('');

  /** Choices in the dropdown */
  readonly options = input<SelectOption[]>([]);

  /** Selected value. Supports [(value)] two-way binding */
  readonly value = model('');

  /** Text shown when nothing is selected */
  readonly placeholder = input('Select an option');

  /** Is the dropdown disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });
}
