import { Component, booleanAttribute, effect, input, model, output, signal } from '@angular/core';

let nextId = 0;

/** Panel that slides up from the bottom of the screen. Drag the handle down, press Escape or click the backdrop to close */
@Component({
  selector: 'nex-bottom-sheet',
  host: { '(document:keydown.escape)': 'dismissable() && close()' },
  templateUrl: './bottom-sheet.html',
  styleUrl: './bottom-sheet.css',
})
export class BottomSheetComponent {
  /** Is the sheet open? Supports [(visible)] two-way binding */
  readonly visible = model(false);

  /** Heading at the top of the sheet */
  readonly header = input('');

  /** Close on backdrop click, Escape and drag-down? */
  readonly dismissable = input(true, { transform: booleanAttribute });

  /** Show the drag handle bar */
  readonly showHandle = input(true, { transform: booleanAttribute });

  /** Maximum height (any CSS length); content scrolls beyond it */
  readonly maxHeight = input('80vh');

  /** Emits after the sheet opens */
  readonly show = output<void>();

  /** Emits after the sheet closes */
  readonly hide = output<void>();

  protected readonly id = `bottom-sheet-${nextId++}`;
  /** How far the sheet is dragged down, in px */
  protected readonly dragY = signal(0);
  protected readonly dragging = signal(false);
  private startY = 0;

  constructor() {
    let wasOpen = false;
    effect(() => {
      const open = this.visible();
      if (open !== wasOpen) (open ? this.show : this.hide).emit();
      wasOpen = open;
    });
  }

  close() {
    this.visible.set(false);
    this.dragY.set(0);
  }

  protected onDragStart(event: PointerEvent) {
    if (!this.dismissable()) return;
    this.startY = event.clientY;
    this.dragging.set(true);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onDragMove(event: PointerEvent) {
    if (this.dragging()) this.dragY.set(Math.max(0, event.clientY - this.startY));
  }

  /** Dragged far enough: close, otherwise spring back */
  protected onDragEnd() {
    if (!this.dragging()) return;
    this.dragging.set(false);
    if (this.dragY() > 100) this.close();
    else this.dragY.set(0);
  }
}
