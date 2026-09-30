import { Component, computed, input } from '@angular/core';

import type { Size } from '../../types';

@Component({
  selector: 'nex-avatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class AvatarComponent {
  /** Image URL. Initials are shown when empty */
  readonly src = input('');

  /** Person's name, used for initials, alt text and the background color */
  readonly name = input('');

  /** How large should the avatar be? */
  readonly size = input<Size>('medium');

  /** Presence dot in the corner */
  readonly status = input<'online' | 'away' | 'offline' | ''>('');

  protected readonly initials = computed(() =>
    this.name()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join(''),
  );

  /** Each name gets its own gradient, so the same person always has the same color */
  protected readonly gradient = computed(() => {
    const hue = [...this.name()].reduce((sum, char) => sum + char.charCodeAt(0) * 7, 0) % 360;
    return `linear-gradient(135deg, hsl(${hue} 80% 62%), hsl(${(hue + 45) % 360} 75% 52%))`;
  });
}
