import { Component, input, numberAttribute } from '@angular/core';

@Component({
  selector: 'np-stepper',
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class StepperComponent {
  /** Step labels in order */
  readonly steps = input<string[]>([]);

  /** Index of the current step, starting at 0 */
  readonly activeStep = input(0, { transform: numberAttribute });
}
