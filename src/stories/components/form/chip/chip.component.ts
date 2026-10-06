import { Component, booleanAttribute, input, model, output, signal } from '@angular/core';

import type { Size, Tone } from '../../../utils/types';
import { IconComponent } from '../../media/icon/icon.component';

/** Looks of the chip */
export const CHIP_VARIANTS = ['default', 'soft', 'outlined', 'solid', 'gradient', 'glass', 'dot'] as const;
export type ChipVariant = (typeof CHIP_VARIANTS)[number];

@Component({
  selector: 'np-chip',
  imports: [IconComponent],
  templateUrl: './chip.html',
  styleUrl: './chip.css',
})
export class ChipComponent {
  /** Chip text */
  readonly label = input('');
  /** Leading icon file name from src/stories/icons/svg */
  readonly icon = input('');
  /** Leading image URL, shown as a circle. Takes precedence over icon */
  readonly image = input('');
  /** Look: default, soft (tinted), outlined, solid, gradient, glass (frosted) or dot (status dot before the label) */
  readonly variant = input<ChipVariant>('default');
  /** Color tone; leave empty for the primary color */
  readonly tone = input<Tone | ''>('');
  /** Chip size */
  readonly size = input<Size>('medium');
  /** Number shown in a small pill after the label (hidden when empty) */
  readonly count = input<number | string>('');
  /** Make the chip a toggle button with a check mark when selected */
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Is a selectable chip on? Supports [(selected)] two-way binding */
  readonly selected = model(false);
  /** Pulse the dot of the `dot` variant (e.g. "Live") */
  readonly pulse = input(false, { transform: booleanAttribute });
  /** Show a remove (×) button that hides the chip */
  readonly removable = input(false, { transform: booleanAttribute });
  /** Dim the chip and disable the remove button */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Emitted when the remove button is clicked */
  readonly remove = output<Event>();

  protected readonly visible = signal(true);

  protected close(event: Event): void {
    this.visible.set(false);
    this.remove.emit(event);
  }
}
