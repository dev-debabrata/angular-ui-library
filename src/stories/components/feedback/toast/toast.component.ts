import {
  Component,
  booleanAttribute,
  effect,
  input,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';

import { TONE_ICONS, type Tone } from '../../../utils/types';

/** Looks of the toast */
export const TOAST_VARIANTS = ['default', 'solid', 'glass', 'gradient', 'pill'] as const;
export type ToastVariant = (typeof TOAST_VARIANTS)[number];

/** Where the toast appears */
export type ToastPosition = `${'top' | 'bottom'}-${'right' | 'left' | 'center'}`;
export const TOAST_POSITIONS = ['top', 'bottom'].flatMap((y) =>
  ['right', 'left', 'center'].map((x) => `${y}-${x}`),
) as ToastPosition[];

@Component({
  selector: 'np-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastComponent {
  /** Is the toast visible? Supports [(open)] two-way binding */
  readonly open = model(false);

  /** Toast text */
  readonly message = input('');

  /** Color tone of the toast */
  readonly type = input<Tone>('info');

  /** Corner (or top/bottom center) of the screen where the toast appears */
  readonly position = input<ToastPosition>('top-right');

  /** Milliseconds before the toast hides itself. 0 keeps it open */
  readonly duration = input(3000, { transform: numberAttribute });

  /** Look: default, solid, glass (frosted, tinted), gradient (gradient border and countdown) or pill (dark, fully rounded) */
  readonly variant = input<ToastVariant>('default');
  /** Bold heading above the message */
  readonly title = input('');
  /** Label of an action button (e.g. "Undo"); clicking it emits actionClick and closes the toast */
  readonly action = input('');
  /** Pause the countdown while the pointer is over the toast */
  readonly pauseOnHover = input(false, { transform: booleanAttribute });
  /** Drag the toast sideways to dismiss it */
  readonly swipeable = input(false, { transform: booleanAttribute });
  /** Emits when the action button is clicked */
  readonly actionClick = output<void>();

  protected readonly icons = TONE_ICONS;
  protected readonly paused = signal(false);
  protected readonly dragX = signal(0);
  protected dragFrom: number | null = null;
  private left = 0; // ms left when paused

  constructor() {
    effect((onCleanup) => {
      if (this.open() && this.duration()) {
        if (this.paused()) return;
        const end = Date.now() + (this.left || this.duration());
        const timer = setTimeout(() => this.open.set(false), end - Date.now());
        onCleanup(() => {
          clearTimeout(timer);
          this.left = end - Date.now();
        });
      } else {
        this.left = 0;
        this.paused.set(false);
      }
    });
  }

  /** Ends a swipe: far enough dismisses, otherwise the toast springs back */
  protected endSwipe(): void {
    if (Math.abs(this.dragX()) > 80) this.open.set(false);
    this.dragX.set(0);
    this.dragFrom = null;
  }
}
