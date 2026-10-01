import { Component, booleanAttribute, input, model, output } from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';

/** Shows `[inplaceDisplay]` content until clicked, then swaps in `[inplaceContent]` */
@Component({
  selector: 'nex-inplace',
  imports: [IconComponent],
  templateUrl: './inplace.html',
  styleUrl: './inplace.css',
})
export class InplaceComponent {
  /** Is the content shown? Supports [(active)] two-way binding */
  readonly active = model(false);
  /** Show a close button to go back to the display? */
  readonly closable = input(false, { transform: booleanAttribute });
  /** Prevent activating? */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Emits when the content is shown */
  readonly activate = output<void>();
  /** Emits when the display is shown again */
  readonly deactivate = output<void>();

  protected open(event?: Event): void {
    event?.preventDefault();
    if (this.disabled() || this.active()) return;
    this.active.set(true);
    this.activate.emit();
  }

  protected close(): void {
    this.active.set(false);
    this.deactivate.emit();
  }
}
