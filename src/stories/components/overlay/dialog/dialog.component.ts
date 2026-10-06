import {
  Component,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  effect,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import type { Tone } from '../../../utils/types';
import { IconComponent } from '../../media/icon/icon.component';

export type DialogPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export const DIALOG_POSITIONS: DialogPosition[] = ['center', 'top', 'bottom', 'left', 'right'];

/** Looks of the dialog */
export const DIALOG_VARIANTS = ['default', 'glass', 'gradient', 'aurora', 'hero'] as const;
export type DialogVariant = (typeof DIALOG_VARIANTS)[number];

let nextId = 0;

@Component({
  selector: 'np-dialog',
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

  /** Smaller text under the title */
  readonly subtitle = input('');
  /** Icon file name from src/stories/icons/svg, shown in a tinted tile before the title */
  readonly icon = input('');
  /** Look: default, glass (frosted), gradient (header band), aurora (soft glow) or hero (big icon, centered) */
  readonly variant = input<DialogVariant>('default');
  /** Color tone of the icon, header band and glow; leave empty for the primary color */
  readonly tone = input<Tone | ''>('');

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

  /** Move the dialog by dragging its header */
  readonly draggable = input(false, { transform: booleanAttribute });
  /** Stop the page behind from scrolling while the dialog is open */
  readonly blockScroll = input(false, { transform: booleanAttribute });

  /** Emits after the dialog opens */
  readonly show = output<void>();

  /** Emits after the dialog closes */
  readonly hide = output<void>();

  protected readonly maximized = signal(false);
  protected readonly offset = signal([0, 0]);
  protected grab: number[] | null = null;
  protected readonly headerId = `np-dialog-${nextId++}`;
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    let wasVisible = false;
    effect(() => {
      const visible = this.visible();
      if (visible === wasVisible) return;
      wasVisible = visible;
      untracked(() => {
        if (!visible) this.maximized.set(false);
        this.offset.set([0, 0]);
        (visible ? this.show : this.hide).emit();
      });
    });

    // Move focus into the dialog when it opens
    effect(() => this.panel()?.nativeElement.focus?.());

    // Browser only (after render): lock the page scroll while open
    afterRenderEffect((onCleanup) => {
      if (!this.visible() || !this.blockScroll()) return;
      document.documentElement.style.overflow = 'hidden';
      onCleanup(() => (document.documentElement.style.overflow = ''));
    });
  }

  close() {
    this.visible.set(false);
  }

  protected onEscape() {
    if (this.visible() && this.closable()) this.close();
  }

  protected dragStart(event: PointerEvent) {
    if ((event.target as Element).closest('button')) return;
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
    this.grab = [event.clientX - this.offset()[0], event.clientY - this.offset()[1]];
  }

  protected onMaskClick() {
    if (this.modal() && this.dismissableMask()) this.close();
  }
}
