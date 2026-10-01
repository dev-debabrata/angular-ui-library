import { Component, booleanAttribute, computed, input, model, output } from '@angular/core';

import { IconComponent } from '../../components/media/icon/icon.component';

export interface ChecklistTask {
  id: string;
  label: string;
  /** Second line under the label */
  description?: string;
  done?: boolean;
}

/** Ring circumference for r = 18 */
const RING = 2 * Math.PI * 18;

/** "Get started" checklist: progress ring, tasks to tick off, and a "Show me" link per task (e.g. to start a tour step) */
@Component({
  selector: 'nex-onboarding-checklist',
  imports: [IconComponent],
  templateUrl: './onboarding-checklist.html',
  styleUrl: './onboarding-checklist.css',
  host: { '[class.checklist--floating]': 'floating()' },
})
export class OnboardingChecklistComponent {
  /** Heading */
  readonly title = input('Get started');

  /** Tasks in order. Ticking one updates it. Supports [(tasks)] two-way binding */
  readonly tasks = model<ChecklistTask[]>([]);

  /** Show only the header. Supports [(collapsed)] two-way binding */
  readonly collapsed = model(false);

  /** Pin to the bottom-right corner of the page */
  readonly floating = input(false, { transform: booleanAttribute });

  /** Text of the per-task help link. Leave empty to hide it */
  readonly showMeLabel = input('Show me');

  /** Emits the task whose "Show me" link was clicked */
  readonly showMe = output<ChecklistTask>();

  /** Emits once when the last task is ticked */
  readonly completed = output<void>();

  protected readonly done = computed(() => this.tasks().filter((t) => t.done).length);
  protected readonly allDone = computed(
    () => this.tasks().length > 0 && this.done() === this.tasks().length,
  );
  protected readonly ring = RING;
  protected readonly offset = computed(() => RING * (1 - this.done() / (this.tasks().length || 1)));

  protected toggle(task: ChecklistTask) {
    const wasDone = this.allDone();
    this.tasks.update((tasks) =>
      tasks.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)),
    );
    if (!wasDone && this.allDone()) this.completed.emit();
  }
}
