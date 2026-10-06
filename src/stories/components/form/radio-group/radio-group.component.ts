import { Component, booleanAttribute, input, model } from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';

export interface RadioOption {
  value: string;
  label: string;
  /** Second line under the label (shown by the default and cards variants) */
  description?: string;
  /** Icon file name from the icons folder (shown by the cards, buttons and chips variants) */
  icon?: string;
  /** Is only this option disabled? */
  disabled?: boolean;
}

/** Looks of the radio group */
export const RADIO_VARIANTS = ['default', 'cards', 'buttons', 'chips'] as const;
export type RadioVariant = (typeof RADIO_VARIANTS)[number];

let nextId = 0;

@Component({
  selector: 'np-radio-group',
  imports: [IconComponent],
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

  /** Look: default (radio dots), cards, buttons (segmented control) or chips */
  readonly variant = input<RadioVariant>('default');

  protected readonly name = `radio-group-${nextId++}`;
}
