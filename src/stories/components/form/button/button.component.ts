import { Component, booleanAttribute, input, output } from '@angular/core';

import type { Size } from '../../../utils/types';

@Component({
  selector: 'storybook-button',
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class ButtonComponent {
  /** Is this the principal call to action on the page? */
  readonly primary = input(false, { transform: booleanAttribute });

  /** What background color to use */
  readonly backgroundColor = input<string>();

  /** How large should the button be? */
  readonly size = input<Size>('medium');

  /** Button contents */
  readonly label = input('Button');

  /** Optional click handler */
  readonly onClick = output<Event>();
}
