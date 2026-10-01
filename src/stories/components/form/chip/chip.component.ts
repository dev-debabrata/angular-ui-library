import { Component, booleanAttribute, input, output, signal } from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';

@Component({
  selector: 'nex-chip',
  imports: [IconComponent],
  templateUrl: './chip.html',
  styleUrl: './chip.css',
})
export class ChipComponent {
  /** Chip text */
  readonly label = input('');
  /** Leading icon file name from src/stories/icons/svg */
  readonly icon = input('');
  /** Leading image URL, shown as a circle. Takes precedence over icon */
  readonly image = input('');
  /** Show a remove (×) button that hides the chip */
  readonly removable = input(false, { transform: booleanAttribute });
  /** Dim the chip and disable the remove button */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Emitted when the remove button is clicked */
  readonly remove = output<Event>();

  protected readonly visible = signal(true);

  protected close(event: Event): void {
    this.visible.set(false);
    this.remove.emit(event);
  }
}
