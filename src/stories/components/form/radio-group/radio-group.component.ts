import { Component, booleanAttribute, input, model } from '@angular/core';

export interface RadioOption {
  value: string;
  label: string;
}

let nextId = 0;

@Component({
  selector: 'nex-radio-group',
  templateUrl: './radio-group.html',
  styleUrl: './radio-group.css',
})
export class RadioGroupComponent {
  /** Text shown above the options */
  readonly label = input('');

  /** Choices to display */
  readonly options = input<RadioOption[]>([]);

  /** Selected value. Supports [(value)] two-way binding */
  readonly value = model('');

  /** Lay options out in a row instead of a column? */
  readonly horizontal = input(false, { transform: booleanAttribute });

  /** Are all options disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly name = `radio-group-${nextId++}`;
}
