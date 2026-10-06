import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';

import { NgTemplateOutlet } from '@angular/common';

import { IconComponent } from '../../media/icon/icon.component';
import type { FieldVariant } from '../../../utils/types';

export interface SelectOption {
  value: string;
  label: string;
  /** Second line under the label */
  description?: string;
  /** Icon file name shown before the label */
  icon?: string;
  /** Avatar image URL shown before the label (e.g. a user picker) */
  image?: string;
  /** CSS color shown as a swatch before the label */
  color?: string;
  /** Heading the option is listed under; options of a group should be next to each other */
  group?: string;
  /** Can't be picked */
  disabled?: boolean;
}

/** Panel layouts: list (rows) or grid (tiles) */
export const SELECT_LAYOUTS = ['list', 'grid'] as const;
export type SelectLayout = (typeof SELECT_LAYOUTS)[number];

let nextId = 0;

@Component({
  selector: 'np-select',
  imports: [NgTemplateOutlet, IconComponent],
  templateUrl: './select.html',
  styleUrl: './select.css',
  host: {
    '(document:pointerdown)': 'onOutside($event)',
    '(window:resize)': 'close()',
    '(window:scroll)': 'close()',
  },
})
export class SelectComponent {
  /** Text shown above the dropdown */
  readonly label = input('');

  /** Choices in the dropdown */
  readonly options = input<SelectOption[]>([]);

  /** Selected value. Supports [(value)] two-way binding */
  readonly value = model('');

  /** Text shown when nothing is selected */
  readonly placeholder = input('Select an option');

  /** Is the dropdown disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Field style: outlined, filled, underline or floating (label inside the field) */
  readonly variant = input<FieldVariant>('outlined');

  /** Icon file name shown at the start of the dropdown (e.g. 'user') */
  readonly icon = input('');

  /** Show a search box at the top of the panel */
  readonly filter = input(false, { transform: booleanAttribute });

  /** Pick several options (checkboxes; the panel stays open). Use [(values)] instead of [(value)] */
  readonly multiple = input(false, { transform: booleanAttribute });

  /** Selected values when `multiple`. Supports [(values)] two-way binding */
  readonly values = model<string[]>([]);

  /** Panel layout: list (rows) or grid (tiles, for icons, avatars or colors) */
  readonly layout = input<SelectLayout>('list');

  protected readonly id = `np-select-${nextId++}`;
  protected readonly open = signal(false);
  /** Highlighted option (index in `shown`), moved by the arrow keys and the pointer */
  protected readonly active = signal(-1);
  protected readonly query = signal('');
  /** Viewport position of the panel, measured from the trigger when it opens */
  protected readonly pos = signal({ top: 0, left: 0, width: 0, up: false });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly search = viewChild<ElementRef<HTMLInputElement>>('search');

  /** Selected options, in option order */
  protected readonly picked = computed(() => this.options().filter((o) => this.isOn(o)));
  protected readonly shown = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.options().filter((o) =>
      `${o.label} ${o.description ?? ''}`.toLowerCase().includes(q),
    );
  });

  constructor() {
    // The panel is a popover (top layer): no ancestor's transform or overflow can move or clip it.
    // It exists only after a click, so this never runs on the server
    effect(() => {
      this.panel()?.nativeElement.showPopover?.();
      this.search()?.nativeElement.focus();
    });
  }

  protected toggle(): void {
    if (this.open()) return this.close();
    // Opens upwards when the panel (list up to 280px + search) doesn't fit below and there's more room above
    const r = this.trigger().nativeElement.getBoundingClientRect();
    const up = r.bottom + 340 > innerHeight && r.top > innerHeight - r.bottom;
    this.pos.set({
      top: up ? innerHeight - r.top + 6 : r.bottom + 6,
      left: r.left,
      width: r.width,
      up,
    });
    this.query.set('');
    this.active.set(this.shown().indexOf(this.picked()[0]));
    this.open.set(true);
  }

  close(focus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    if (focus) this.trigger().nativeElement.focus();
  }

  protected isOn(option: SelectOption): boolean {
    return this.multiple() ? this.values().includes(option.value) : option.value === this.value();
  }

  /** Single: select and close. Multiple: toggle and keep the panel open */
  protected pick(option: SelectOption): void {
    if (option.disabled) return;
    const v = option.value;
    if (!this.multiple()) {
      this.value.set(v);
      return this.close(true);
    }
    this.values.update((vs) => (vs.includes(v) ? vs.filter((x) => x !== v) : [...vs, v]));
  }

  protected onOutside(event: Event): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  protected onKeydown(e: KeyboardEvent): void {
    const { key } = e;
    if (!this.open()) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) {
        e.preventDefault();
        this.toggle();
      }
      return;
    }
    const moves: Record<string, [number, number]> = {
      ArrowDown: [this.active() + 1, 1],
      ArrowUp: [this.active() - 1, -1],
      Home: [0, 1],
      End: [this.shown().length - 1, -1],
    };
    if (key in moves) {
      e.preventDefault();
      this.move(...moves[key]);
    } else if (key === 'Enter' || (key === ' ' && !this.filter())) {
      e.preventDefault();
      const option = this.shown()[this.active()];
      if (option) this.pick(option);
    } else if (key === 'Escape') {
      e.preventDefault();
      this.close(true);
    } else if (key === 'Tab') this.close();
    else if (key.length === 1 && !this.filter()) {
      // Type-ahead: jump to the next option starting with the typed letter
      const shown = this.shown();
      const next = [...shown.keys()]
        .map((i) => (this.active() + 1 + i) % shown.length)
        .find((i) => shown[i].label.toLowerCase().startsWith(key.toLowerCase()));
      if (next != null) this.move(next, 1);
    }
  }

  /** Highlights the option at `i` (wrapping), skipping disabled ones in direction `dir` */
  private move(i: number, dir: number): void {
    const shown = this.shown();
    for (let n = 0; n < shown.length; n++, i += dir) {
      const j = (i + shown.length) % shown.length;
      if (!shown[j].disabled) {
        this.active.set(j);
        document.getElementById(`${this.id}-${j}`)?.scrollIntoView({ block: 'nearest' });
        return;
      }
    }
  }
}
