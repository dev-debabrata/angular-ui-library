import { Component, booleanAttribute, input, output, signal } from '@angular/core';

import { TONES, type Size, type Tone } from '../../../utils/types';
import { IconComponent } from '../icon/icon.component';

export type TagSeverity = Tone | 'primary';

export const TAG_SEVERITIES: TagSeverity[] = ['primary', ...TONES];

/** Looks of the tag */
export const TAG_VARIANTS = ['default', 'soft', 'outlined', 'gradient', 'dot'] as const;
export type TagVariant = (typeof TAG_VARIANTS)[number];

@Component({
  selector: 'np-tag',
  imports: [IconComponent],
  templateUrl: './tag.html',
  styleUrl: './tag.css',
})
export class TagComponent {
  /** Tag text */
  readonly value = input('Tag');
  /** Color of the tag. `primary` uses the brand gradient */
  readonly severity = input<TagSeverity>('primary');
  /** Leading icon file name from src/stories/icons/svg */
  readonly icon = input('');
  /** Fully rounded (pill) corners? */
  readonly rounded = input(false, { transform: booleanAttribute });
  /** Look: default (solid), soft (tinted), outlined, gradient (severity to accent) or dot (status dot on a plain tag) */
  readonly variant = input<TagVariant>('default');
  /** Tag size */
  readonly size = input<Size>('medium');
  /** Number shown in a small pill after the text (hidden when empty) */
  readonly count = input<number | string>('');
  /** Show a remove (×) button that hides the tag */
  readonly removable = input(false, { transform: booleanAttribute });
  /** Emitted when the remove button is clicked */
  readonly remove = output<Event>();

  protected readonly visible = signal(true);
}
