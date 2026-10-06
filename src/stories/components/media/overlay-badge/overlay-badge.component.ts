import { Component, booleanAttribute, computed, input, numberAttribute } from '@angular/core';

import type { Size, Tone } from '../../../utils/types';
import { IconComponent } from '../icon/icon.component';

/** Looks of the badge */
export const OVERLAY_BADGE_VARIANTS = ['default', 'gradient', 'soft', 'outlined', 'glass'] as const;
export type OverlayBadgeVariant = (typeof OVERLAY_BADGE_VARIANTS)[number];

export type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

/** Small count or dot overlaid on the corner of its content (icon, avatar, button) */
@Component({
  selector: 'np-overlay-badge',
  imports: [IconComponent],
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
  /** Look: default (solid), gradient (glowing), soft (tinted), outlined or glass (frosted) */
  readonly variant = input<OverlayBadgeVariant>('default');
  /** Animated ping around the badge, to draw attention (live, new) */
  readonly pulse = input(false, { transform: booleanAttribute });
  /** Icon file name from src/stories/icons/svg shown instead of the value (e.g. a verified check) */
  readonly icon = input('');
  /** The content is round (avatar): sit on the circle's edge instead of the box corner */
  readonly circular = input(false, { transform: booleanAttribute });

  protected readonly text = computed(() => {
    const value = this.value();
    return typeof value === 'number' && value > this.max() ? `${this.max()}+` : String(value);
  });

  protected readonly visible = computed(
    () =>
      !this.hidden() &&
      (this.dot() ||
        this.icon() ||
        (this.text() !== '' && (this.showZero() || this.value() !== 0))),
  );
}
