import { Component, booleanAttribute, input } from '@angular/core';

import { TONES, type Tone } from '../../../utils/types';
import { IconComponent } from '../icon/icon.component';

export type TagSeverity = Tone | 'primary';

export const TAG_SEVERITIES: TagSeverity[] = ['primary', ...TONES];

@Component({
  selector: 'nex-tag',
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
}
