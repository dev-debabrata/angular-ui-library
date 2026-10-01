import { Component, input, model } from '@angular/core';

@Component({
  selector: 'nex-modal',
  host: {
    '(document:keydown.escape)': 'close()',
  },
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class ModalComponent {
  /** Is the modal visible? Supports [(open)] two-way binding */
  readonly open = model(false);

  /** Heading shown at the top of the modal */
  readonly title = input('');

  close() {
    this.open.set(false);
  }
}
