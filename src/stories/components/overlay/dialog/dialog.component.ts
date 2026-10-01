import {
  Component,
  ElementRef,
  booleanAttribute,
  effect,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';

export type DialogPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export const DIALOG_POSITIONS: DialogPosition[] = ['center', 'top', 'bottom', 'left', 'right'];

let nextId = 0;

@Component({
  selector: 'nex-dialog',
  imports: [IconComponent],
  host: { '(document:keydown.escape)': 'onEscape()' },
  templateUrl: './dialog.html',
  styleUrl: './dialog.css',
})
export class DialogComponent {
  /** Is the dialog visible? Supports [(visible)] two-way binding */
  readonly visible = model(false);

  /** Title shown in the header */
  readonly header = input('');

  /** Dim and blur the page behind the dialog and block clicks on it */
  readonly modal = input(true, { transform: booleanAttribute });

  /** Show the × button and close on Escape */
  readonly closable = input(true, { transform: booleanAttribute });

  /** Close when the dimmed backdrop is clicked (modal only) */
  readonly dismissableMask = input(false, { transform: booleanAttribute });

  /** Show a button that toggles fullscreen */
  readonly maximizable = input(false, { transform: booleanAttribute });

  /** Where the dialog sits on the screen */
  readonly position = input<DialogPosition>('center');

  /** CSS width of the dialog, e.g. '480px' or '50vw' */
  readonly width = input('480px');

  /** Emits after the dialog opens */
  readonly show = output<void>();

  /** Emits after the dialog closes */
  readonly hide = output<void>();

  protected readonly maximized = signal(false);
  protected readonly headerId = `nex-dialog-${nextId++}`;
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    let wasVisible = false;
    effect(() => {
      const visible = this.visible();
      if (visible === wasVisible) return;
      wasVisible = visible;
      untracked(() => {
        if (!visible) this.maximized.set(false);
        (visible ? this.show : this.hide).emit();
      });
    });

    // Move focus into the dialog when it opens
    effect(() => this.panel()?.nativeElement.focus?.());
  }

  close() {
    this.visible.set(false);
  }

  protected onEscape() {
    if (this.visible() && this.closable()) this.close();
  }

  protected onMaskClick() {
    if (this.modal() && this.dismissableMask()) this.close();
  }
}
