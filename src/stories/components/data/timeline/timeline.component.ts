import { Component, TemplateRef, contentChild, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import type { Tone } from '../../../utils/types';
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
}

@Component({
  selector: 'nex-timeline',
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

  /** Optional `<ng-template #content let-event>` that replaces the default event content */
  protected readonly contentTemplate =
    contentChild<TemplateRef<{ $implicit: TimelineEvent }>>('content');
}
