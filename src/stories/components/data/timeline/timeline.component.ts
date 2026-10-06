import {
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  input,
  numberAttribute,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { TONES, type Tone } from '../../../utils/types';
import { IconComponent } from '../../media/icon/icon.component';

export interface TimelineEvent {
  /** Title of the event, shown in bold */
  status: string;
  /** Date or time text, shown muted */
  date: string;
  /** Icon file name from src/stories/icons/svg, shown in the marker */
  icon?: string;
  /** Marker color. Leave empty for the brand gradient */
  tone?: Tone;
  /** Optional longer text under the title */
  description?: string;
  /** Small label next to the title (e.g. "v2.1", "Urgent"), colored by `tone` */
  tag?: string;
}

/** Looks of the timeline */
export const TIMELINE_VARIANTS = ['default', 'cards', 'outlined', 'gradient', 'compact'] as const;
export type TimelineVariant = (typeof TIMELINE_VARIANTS)[number];

@Component({
  selector: 'np-timeline',
  imports: [NgTemplateOutlet, IconComponent],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css',
})
export class TimelineComponent {
  /** Events in chronological order */
  readonly value = input<TimelineEvent[]>([]);

  /** Side of the line the content sits on. 'alternate' switches sides for every event */
  readonly align = input<'left' | 'right' | 'alternate'>('left');

  /** Direction of the line */
  readonly layout = input<'vertical' | 'horizontal'>('vertical');

  /** Look: default, cards, outlined (hollow markers), gradient (gradient line, glowing markers) or compact */
  readonly variant = input<TimelineVariant>('default');

  /** Current event (-1 = off): earlier ones are done (filled line), it pulses, later ones are pending */
  readonly activeIndex = input(-1, { transform: numberAttribute });

  /** Line and marker color: a tone (success, info, warning, danger, neutral) or any CSS color. Empty: the brand gradient */
  readonly lineColor = input('');

  /** Show each date on the other side of the line, facing its content */
  readonly dateOpposite = input(false, { transform: booleanAttribute });

  protected readonly lineTone = computed(() =>
    (TONES as string[]).includes(this.lineColor()) ? this.lineColor() : '',
  );

  /** Optional `<ng-template #content let-event>` that replaces the default event content */
  protected readonly contentTemplate =
    contentChild<TemplateRef<{ $implicit: TimelineEvent }>>('content');
}
