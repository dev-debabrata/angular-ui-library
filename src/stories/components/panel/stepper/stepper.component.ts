import {
  Component,
  booleanAttribute,
  computed,
  input,
  linkedSignal,
  numberAttribute,
  output,
} from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';

export interface StepItem {
  label: string;
  /** Second line under the label */
  description?: string;
  /** Icon file name shown in the marker instead of the number */
  icon?: string;
  /** Marks the step as failed (red marker with "!") */
  error?: boolean;
}

export const STEPPER_VARIANTS = ['circles', 'progress', 'dots', 'arrows', 'cards'] as const;
export type StepperVariant = (typeof STEPPER_VARIANTS)[number];

type StepState = 'done' | 'active' | 'upcoming' | 'error';

@Component({
  selector: 'np-stepper',
  imports: [IconComponent],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class StepperComponent {
  /** Steps in order: labels, or objects with a description, icon or error */
  readonly steps = input<(string | StepItem)[]>([]);

  /** Index of the current step, starting at 0. Supports [(activeStep)] when clickable */
  readonly activeStep = input(0, { transform: numberAttribute });

  /** Look: circles (default), progress (segmented bars), dots, arrows (chevrons) or cards */
  readonly variant = input<StepperVariant>('circles');

  /** Steps in a column, timeline style (circles, dots and cards) */
  readonly vertical = input(false, { transform: booleanAttribute });

  /** Steps can be clicked to go to them */
  readonly clickable = input(false, { transform: booleanAttribute });

  /** With clickable: only finished steps can be clicked (turn off to allow any step) */
  readonly linear = input(true, { transform: booleanAttribute });

  /** The step that was clicked, now the current one (its index). Makes [(activeStep)] work */
  readonly activeStepChange = output<number>();

  /** The current step: follows activeStep, and moves on clicks */
  protected readonly current = linkedSignal(() => this.activeStep());

  protected readonly items = computed(() =>
    this.steps().map((step): StepItem => (typeof step === 'string' ? { label: step } : step)),
  );

  protected stateOf(index: number, step: StepItem): StepState {
    if (step.error) return 'error';
    const current = this.current();
    return index < current ? 'done' : index === current ? 'active' : 'upcoming';
  }

  protected canClick(index: number) {
    return this.clickable() && index !== this.current() && (!this.linear() || index < this.current());
  }

  protected go(index: number) {
    if (!this.canClick(index)) return;
    this.current.set(index);
    this.activeStepChange.emit(index);
  }
}
