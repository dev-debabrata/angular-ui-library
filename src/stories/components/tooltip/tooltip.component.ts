import { Component, input } from '@angular/core';

let nextId = 0;

@Component({
  selector: 'nex-tooltip',
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.css',
})
export class TooltipComponent {
  /** Text shown in the tooltip */
  readonly text = input('');

  /** Where the tooltip appears */
  readonly position = input<'top' | 'bottom' | 'left' | 'right'>('top');

  protected readonly id = `tooltip-${nextId++}`;
}
