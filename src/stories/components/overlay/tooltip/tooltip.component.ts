import { Component, booleanAttribute, input, numberAttribute } from '@angular/core';

import type { Tone } from '../../../utils/types';

/** Looks of the tooltip */
export const TOOLTIP_VARIANTS = ['default', 'light', 'soft', 'gradient', 'glass'] as const;
export type TooltipVariant = (typeof TOOLTIP_VARIANTS)[number];

let nextId = 0;

@Component({
  selector: 'np-tooltip',
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.css',
})
export class TooltipComponent {
  /** Text shown in the tooltip */
  readonly text = input('');
  /** Where the tooltip appears */
  readonly position = input<'top' | 'bottom' | 'left' | 'right'>('top');
  /** Look: default (dark), light, soft (tinted), gradient or glass (frosted) */
  readonly variant = input<TooltipVariant>('default');
  /** Color tone of the default (solid) and soft variants; leave empty for the theme colors */
  readonly tone = input<Tone | ''>('');
  /** Bold title above the text, for richer tooltips */
  readonly heading = input('');
  /** Keyboard shortcut shown as keys after the text, joined with "+" (e.g. "Ctrl+K") */
  readonly shortcut = input('');
  /** Show the arrow pointing at the element */
  readonly arrow = input(true, { transform: booleanAttribute });
  /** Delay in ms before the tooltip shows */
  readonly showDelay = input(0, { transform: numberAttribute });
  /** Delay in ms before the tooltip hides */
  readonly hideDelay = input(0, { transform: numberAttribute });

  protected readonly id = `tooltip-${nextId++}`;
}
