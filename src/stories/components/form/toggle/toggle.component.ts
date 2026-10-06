import { Component, booleanAttribute, computed, input, model } from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';

/** Looks of the switch */
export const TOGGLE_VARIANTS = ['default', 'ios', 'labeled', 'icon'] as const;
export type ToggleVariant = (typeof TOGGLE_VARIANTS)[number];

/** Sizes of the switch */
export const TOGGLE_SIZES = ['small', 'medium', 'large'] as const;
export type ToggleSize = (typeof TOGGLE_SIZES)[number];

const ICON_SIZES: Record<ToggleSize, number> = { small: 10, medium: 12, large: 16 };

@Component({
  selector: 'np-toggle',
  imports: [IconComponent],
  templateUrl: './toggle.html',
  styleUrl: './toggle.css',
})
export class ToggleComponent {
  /** Text next to the switch */
  readonly label = input('');

  /** Is the switch on? Supports [(checked)] two-way binding */
  readonly checked = model(false);

  /** Is the switch disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Look: default, ios, labeled (text in the track) or icon (icon in the thumb) */
  readonly variant = input<ToggleVariant>('default');

  /** Size of the switch */
  readonly size = input<ToggleSize>('medium');

  /** Side of the switch the label is on */
  readonly labelPosition = input<'right' | 'left'>('right');

  /** Text in the track when on (labeled variant) */
  readonly onLabel = input('On');

  /** Text in the track when off (labeled variant) */
  readonly offLabel = input('Off');

  /** Icon file name in the thumb when on (icon variant) */
  readonly onIcon = input('check');

  /** Icon file name in the thumb when off (icon variant) */
  readonly offIcon = input('x');

  protected readonly iconSize = computed(() => ICON_SIZES[this.size()] ?? ICON_SIZES.medium);
}
