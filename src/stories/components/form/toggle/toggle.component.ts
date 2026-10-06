import { Component, booleanAttribute, input, model } from '@angular/core';

@Component({
  selector: 'np-toggle',
  templateUrl: './toggle.html',
  styleUrl: './toggle.css',
})
export class ToggleComponent {
  /** Text next to the switch */
  readonly label = input('');

  /** Is the switch on? Supports [(checked)] two-way binding */
  readonly checked = model(false);

  /** Is the switch disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });
}
