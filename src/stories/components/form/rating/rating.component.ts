import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
  signal,
  viewChildren,
} from '@angular/core';

import type { Size } from '../../../utils/types';

/** Looks of the rating */
export const RATING_VARIANTS = ['star', 'heart', 'emoji', 'number', 'bar'] as const;
export type RatingVariant = (typeof RATING_VARIANTS)[number];

const SHAPES: Partial<Record<RatingVariant, string>> = {
  star: 'M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96z',
  heart:
    'M12 20.5s-7.6-4.6-9.5-9.3C1.1 7.8 3.3 4 6.8 4c2.1 0 3.6 1.2 5.2 3.1C13.6 5.2 15.1 4 17.2 4c3.5 0 5.7 3.8 4.3 7.2-1.9 4.7-9.5 9.3-9.5 9.3z',
};

/** Faces from worst to best; other lengths pick evenly from these */
const FACES = ['😞', '🙁', '😐', '🙂', '😍'];

@Component({
  selector: 'np-rating',
  templateUrl: './rating.html',
  styleUrl: './rating.css',
})
export class RatingComponent {
  /** Selected rating. Supports [(value)] two-way binding */
  readonly value = model(0);

  /** Number of stars */
  readonly max = input(5, { transform: numberAttribute });

  /** Display only, no clicking? */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** Look: star, heart, emoji (faces), number (a 1…max scale) or bar (segments, like a meter) */
  readonly variant = input<RatingVariant>('star');

  /** Allow half values (star and heart): the left half of an item picks n − 0.5 */
  readonly allowHalf = input(false, { transform: booleanAttribute });

  /** Clicking the current value again clears the rating */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** Item size */
  readonly size = input<Size>('medium');

  /** Words per value shown next to the items, e.g. ['Terrible', 'Bad', 'Okay', 'Good', 'Great'] */
  readonly labels = input<string[]>([]);

  /** Show the number next to the items, e.g. "4.5 / 5" */
  readonly showValue = input(false, { transform: booleanAttribute });

  protected readonly hover = signal(0);
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('btn');

  protected readonly items = computed(() => Array.from({ length: this.max() }, (_, i) => i + 1));
  protected readonly shape = computed(() => SHAPES[this.variant()] ?? '');
  protected readonly half = computed(() => this.allowHalf() && !!this.shape());
  /** Hovered value, else the selected one */
  protected readonly shown = computed(() => this.hover() || this.value());
  /** The item that holds the hovered or selected value */
  protected readonly current = computed(() => Math.ceil(this.shown()));
  /** The item that holds the selected value: the checked radio and the roving tab stop */
  protected readonly checkedItem = computed(() => Math.ceil(this.value()));

  protected readonly caption = computed(() => {
    const number = this.showValue() ? `${this.shown()} / ${this.max()}` : '';
    return [number, this.labels()[this.current() - 1]].filter(Boolean).join(' · ');
  });

  /** How much of an item is filled, 0–100 */
  protected fill(item: number): number {
    return Math.max(0, Math.min(1, this.shown() - (item - 1))) * 100;
  }

  protected face(item: number): string {
    return FACES[Math.round(((item - 1) / Math.max(this.max() - 1, 1)) * (FACES.length - 1))];
  }

  protected onPointer(event: PointerEvent, item: number): void {
    if (!this.readonly()) this.hover.set(this.pointValue(event, item));
  }

  protected pick(event: MouseEvent, item: number): void {
    // Keyboard clicks (detail 0) take the whole item
    const value = event.detail ? this.pointValue(event, item) : item;
    this.value.set(this.clearable() && value === this.value() ? 0 : value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const step = this.half() ? 0.5 : 1;
    const moves: Record<string, number> = {
      ArrowRight: step,
      ArrowUp: step,
      ArrowLeft: -step,
      ArrowDown: -step,
      Home: -Infinity,
      End: Infinity,
    };
    const move = moves[event.key];
    if (move == null) return;
    event.preventDefault();
    const value = Math.max(this.clearable() ? 0 : step, Math.min(this.max(), this.value() + move));
    this.value.set(value);
    this.buttons()[Math.max(0, Math.ceil(value) - 1)]?.nativeElement.focus();
  }

  /** item − 0.5 when the pointer is on the left half of a half-enabled item */
  private pointValue(event: MouseEvent, item: number): number {
    if (!this.half()) return item;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    return event.clientX - rect.left < rect.width / 2 ? item - 0.5 : item;
  }
}
