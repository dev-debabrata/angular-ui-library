import { Component, booleanAttribute, computed, input, numberAttribute } from '@angular/core';

import type { Size, Tone } from '../../../utils/types';

export type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

/** Small count or dot overlaid on the corner of its content (icon, avatar, button) */
@Component({
  selector: 'np-overlay-badge',
  templateUrl: './overlay-badge.html',
  styleUrl: './overlay-badge.css',
})
export class OverlayBadgeComponent {
  /** Number or short text shown in the badge */
  readonly value = input<number | string>('');

  /** Numbers above this show as "max+" (e.g. 99+) */
  readonly max = input(99, { transform: numberAttribute });

  /** Show a small dot instead of the value */
  readonly dot = input(false, { transform: booleanAttribute });

  /** Keep the badge visible when the value is 0 */
  readonly showZero = input(false, { transform: booleanAttribute });

  /** Hide the badge */
  readonly hidden = input(false, { transform: booleanAttribute });

  /** Color tone of the badge */
  readonly severity = input<Tone>('danger');

  /** Corner of the content the badge sits on */
  readonly position = input<BadgePosition>('top-right');

  /** Badge size */
  readonly size = input<Size>('medium');

  /** Accessible description, e.g. "6 unread messages" */
  readonly ariaLabel = input('');

  protected readonly text = computed(() => {
    const value = this.value();
    return typeof value === 'number' && value > this.max() ? `${this.max()}+` : String(value);
  });

  protected readonly visible = computed(
    () =>
      !this.hidden() &&
      (this.dot() || (this.text() !== '' && (this.showZero() || this.value() !== 0))),
  );
}
