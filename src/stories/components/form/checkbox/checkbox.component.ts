import { Component, booleanAttribute, input, model } from '@angular/core';

import type { Size } from '../../../utils/types';
import { IconComponent } from '../../media/icon/icon.component';

/** Looks of the checkbox */
export const CHECKBOX_VARIANTS = ['default', 'circle', 'card', 'chip', 'todo'] as const;
export type CheckboxVariant = (typeof CHECKBOX_VARIANTS)[number];

@Component({
  selector: 'np-checkbox',
  imports: [IconComponent],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.css',
})
export class CheckboxComponent {
  /** Text next to the checkbox */
  readonly label = input('');

  /** Second line under the label */
  readonly description = input('');

  /** Is the checkbox checked? Supports [(checked)] two-way binding */
  readonly checked = model(false);

  /** Show a dash for a partly checked state (e.g. "select all"); cleared on click. Supports [(indeterminate)] */
  readonly indeterminate = model(false);

  /** Is the checkbox disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Show a red border? */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** Look: default (square), circle, card (bordered tile), chip (pill) or todo (label struck through when checked) */
  readonly variant = input<CheckboxVariant>('default');

  /** Box and text size */
  readonly size = input<Size>('medium');

  /** Icon file name shown by the card and chip variants */
  readonly icon = input('');

  protected onChange(event: Event): void {
    this.indeterminate.set(false);
    this.checked.set((event.target as HTMLInputElement).checked);
  }
}
