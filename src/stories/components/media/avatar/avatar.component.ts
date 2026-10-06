import { Component, booleanAttribute, computed, input, numberAttribute } from '@angular/core';

import type { Size } from '../../../utils/types';
import { IconComponent } from '../icon/icon.component';

/** Looks of the avatar */
export const AVATAR_VARIANTS = ['default', 'ring', 'soft', 'square', 'glass'] as const;
export type AvatarVariant = (typeof AVATAR_VARIANTS)[number];

@Component({
  selector: 'np-avatar',
  imports: [IconComponent],
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
  host: { '[class.stacked]': 'stacked()' },
})
export class AvatarComponent {
  /** Image URL. Initials are shown when empty */
  readonly src = input('');

  /** Person's name, used for initials, alt text and the background color */
  readonly name = input('');

  /** How large should the avatar be? */
  readonly size = input<Size>('medium');

  /** Presence dot in the corner */
  readonly status = input<'online' | 'away' | 'busy' | 'offline' | ''>('');
  /** Look: default, ring (gradient story ring), soft (tinted initials), square (rounded square) or glass (frosted) */
  readonly variant = input<AvatarVariant>('default');
  /** Icon file name from src/stories/icons/svg, shown when there's no image and no name */
  readonly icon = input('');
  /** Show "+N" instead of a person, e.g. the hidden members at the end of a stack */
  readonly more = input(0, { transform: numberAttribute });
  /** Overlap the previous avatar, for avatar groups (put the avatars side by side in a flex row) */
  readonly stacked = input(false, { transform: booleanAttribute });

  protected readonly initials = computed(() =>
    this.name()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join(''),
  );

  /** Each name gets its own hue, so the same person always has the same color */
  protected readonly hue = computed(
    () => [...this.name()].reduce((sum, char) => sum + char.charCodeAt(0) * 7, 0) % 360,
  );
}
