import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { IconComponent } from '../../media/icon/icon.component';
import { type AnchorPosition, anchorPosition } from '../../../utils/anchor-position';
import type { FieldVariant } from '../../../utils/types';

type TimeUnit = 'hour' | 'minute' | 'second' | 'meridian';

const pad = (n: number) => String(n).padStart(2, '0');

/** Format the time part of `date` as "14:05", "02:05 PM" or with seconds "14:05:09" */
export function formatTime(date: Date, hourFormat: '12' | '24' = '24', showSeconds = false) {
  const h = date.getHours();
  const hours = hourFormat === '12' ? pad(h % 12 || 12) : pad(h);
  const seconds = showSeconds ? ':' + pad(date.getSeconds()) : '';
  const meridian = hourFormat === '12' ? (h < 12 ? ' AM' : ' PM') : '';
  return `${hours}:${pad(date.getMinutes())}${seconds}${meridian}`;
}

/** Parse typed text like "14:30", "2:30 pm", "9am" or "0930" onto the date of `base`. Returns null when invalid */
export function parseTime(text: string, base: Date): Date | null {
  const match = /^(\d{1,2})(?::?(\d{2}))?\s*([ap])?\.?m?\.?$/i.exec(text.trim());
  if (!match) return null;
  let h = +match[1];
  const m = +(match[2] ?? 0);
  const meridian = match[3]?.toLowerCase();
  if (meridian) {
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (meridian === 'p' ? 12 : 0);
  }
  if (h > 23 || m > 59) return null;
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Minutes since midnight */
const minutesOf = (d: Date) => d.getHours() * 60 + d.getMinutes();

/** Minutes since midnight for "HH:mm", or `fallback` when empty */
const toMinutes = (hhmm: string, fallback: number) => {
  const [h, m] = hhmm.split(':').map(Number);
  return hhmm ? h * 60 + (m || 0) : fallback;
};

/** Move `value` one `step` up or down, snapping to multiples of the step and wrapping at `max` */
function spin(value: number, step: number, dir: 1 | -1, max: number) {
  const next =
    dir > 0 ? Math.floor(value / step) * step + step : Math.ceil(value / step) * step - step;
  return (next + max) % max;
}

let nextId = 0;

@Component({
  selector: 'np-time-picker',
  imports: [NgTemplateOutlet, IconComponent],
  host: {
    '(document:keydown.escape)': 'close()',
    '(document:click)': 'onDocumentClick($event)',
    '(window:resize)': 'reposition()',
    '(window:scroll)': 'reposition()',
  },
  templateUrl: './time-picker.html',
  styleUrl: './time-picker.css',
})
export class TimePickerComponent {
  /** Selected time (the date part is kept). Supports [(value)] two-way binding */
  readonly value = model<Date | null>(null);

  /** 24-hour clock or 12-hour clock with an AM/PM toggle */
  readonly hourFormat = input<'12' | '24'>('24');

  /** Show a seconds column? */
  readonly showSeconds = input(false, { transform: booleanAttribute });

  /** Hours added or removed per step */
  readonly stepHour = input(1, { transform: numberAttribute });

  /** Minutes added or removed per step */
  readonly stepMinute = input(1, { transform: numberAttribute });

  /** 'spinner': up/down columns. 'list': typeable input with a dropdown of times every `interval` minutes */
  readonly mode = input<'spinner' | 'list'>('spinner');

  /** Minutes between options in list mode */
  readonly interval = input(30, { transform: numberAttribute });

  /** Earliest option in list mode, "HH:mm" (24-hour) */
  readonly minTime = input('');

  /** Latest option in list mode, "HH:mm" (24-hour) */
  readonly maxTime = input('');

  /** Show the spinner panel directly (true) or an input that opens it in a popup (false). List mode always uses a popup */
  readonly inline = input(true, { transform: booleanAttribute });

  /** Text shown above the picker */
  readonly label = input('');

  /** Text shown in the popup input when no time is selected */
  readonly placeholder = input('Select time');

  /** Is the picker disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Style of the popup/list input field: outlined, filled, underline or floating (label inside the field) */
  readonly variant = input<FieldVariant>('outlined');

  protected readonly id = `np-time-picker-${nextId++}`;
  protected readonly opened = signal(false);
  protected readonly position = signal<AnchorPosition | null>(null);
  /** Text typed into the list-mode input, until it is committed on blur/Enter */
  protected readonly draft = signal<string | null>(null);
  /** Keyboard-highlighted option in list mode */
  protected readonly active = signal(-1);
  protected readonly fieldWidth = signal(0);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly field = viewChild<ElementRef<HTMLElement>>('field');
  private readonly popup = viewChild<ElementRef<HTMLElement>>('popup');

  /** Time shown in the spinners: the value, or midnight today before anything is picked */
  private readonly current = computed(
    () => this.value() ?? new Date(new Date().setHours(0, 0, 0, 0)),
  );

  /** Popup and list modes show an input field (the variant styles it); inline spinner mode shows the panel */
  protected readonly hasField = computed(() => !this.inline() || this.mode() === 'list');

  /** The field's class: its variant, only when there is an input field */
  protected readonly fieldClass = computed(() =>
    this.hasField() ? 'ui-field--' + this.variant() : '',
  );

  protected readonly text = computed(() => {
    const v = this.value();
    return v ? formatTime(v, this.hourFormat(), this.showSeconds()) : '';
  });

  /** List-mode options from minTime to maxTime, every `interval` minutes, on the date of the current value */
  protected readonly options = computed(() => {
    const selected = this.value();
    const options: { date: Date; label: string; selected: boolean }[] = [];
    const last = toMinutes(this.maxTime(), 24 * 60 - 1);
    for (let t = toMinutes(this.minTime(), 0); t <= last; t += Math.max(1, this.interval())) {
      const date = new Date(this.current());
      date.setHours(0, t, 0, 0);
      options.push({
        date,
        label: formatTime(date, this.hourFormat()),
        selected: !!selected && minutesOf(selected) === t,
      });
    }
    return options;
  });

  /** Spinner columns in display order */
  protected readonly columns = computed(() => {
    const d = this.current();
    const [h, m, s] = [d.getHours(), d.getMinutes(), d.getSeconds()];
    const twelve = this.hourFormat() === '12';
    const col = (unit: TimeUnit, label: string, now: number, max: number, text = pad(now)) => ({
      unit,
      label,
      now,
      max,
      text,
    });
    return [
      col('hour', 'Hour', h, 23, pad(twelve ? h % 12 || 12 : h)),
      col('minute', 'Minute', m, 59),
      ...(this.showSeconds() ? [col('second', 'Second', s, 59)] : []),
      ...(twelve ? [col('meridian', 'AM/PM', h < 12 ? 0 : 1, 1, h < 12 ? 'AM' : 'PM')] : []),
    ];
  });

  constructor() {
    // Measure and place the popup when it opens
    effect(() => {
      this.position.set(null);
      if (this.popup()) this.reposition();
    });
    // Keep the highlighted option scrolled into view
    effect(() => {
      const i = this.active();
      this.popup()
        ?.nativeElement.querySelector(`[data-index="${i}"]`)
        ?.scrollIntoView({ block: 'nearest' });
    });
  }

  /** Step one column up (1) or down (-1). Values wrap around; 12-hour hours stay in the same half of the day */
  protected step(unit: TimeUnit, dir: 1 | -1) {
    if (this.disabled()) return;
    const d = new Date(this.current());
    const h = d.getHours();
    const half = this.hourFormat() === '12' ? 12 : 24;
    if (unit === 'hour') d.setHours(spin(h % half, this.stepHour(), dir, half) + h - (h % half));
    else if (unit === 'minute') d.setMinutes(spin(d.getMinutes(), this.stepMinute(), dir, 60));
    else if (unit === 'second') d.setSeconds(spin(d.getSeconds(), 1, dir, 60));
    else d.setHours((h + 12) % 24);
    this.value.set(d);
  }

  protected onWheel(event: WheelEvent, unit: TimeUnit) {
    if (this.disabled()) return;
    event.preventDefault();
    this.step(unit, event.deltaY < 0 ? 1 : -1);
  }

  protected onKeydown(event: KeyboardEvent, unit: TimeUnit) {
    const dir = event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0;
    if (!dir) return;
    event.preventDefault();
    this.step(unit, dir);
  }

  protected open() {
    if (this.disabled() || this.opened()) return;
    this.opened.set(true);
    // Highlight the selected option, or the first one at/after the current time
    const v = this.value();
    const index = v ? this.options().findIndex((o) => minutesOf(o.date) >= minutesOf(v)) : -1;
    this.active.set(v ? Math.max(0, index) : -1);
  }

  protected toggle() {
    return this.opened() ? this.close() : this.open();
  }

  protected close() {
    this.opened.set(false);
    this.draft.set(null);
  }

  /** List mode: pick an option */
  protected choose(date: Date) {
    this.value.set(new Date(date));
    this.close();
  }

  /** List mode: turn typed text into a time. Empty clears the value; invalid text is discarded */
  protected commit() {
    const text = this.draft();
    if (text === null) return;
    this.draft.set(null);
    if (!text.trim()) this.value.set(null);
    else {
      const parsed = parseTime(text, this.current());
      if (parsed) this.value.set(parsed);
    }
  }

  /** Field keyboard. Spinner mode: Enter/ArrowDown open the panel. List mode: arrows move the highlight, Enter picks it or commits typed text */
  protected onFieldKeydown(event: KeyboardEvent) {
    const { key } = event;
    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Enter') return;
    event.preventDefault();
    if (this.mode() === 'spinner' || (!this.opened() && key !== 'Enter')) return this.open();
    if (key === 'Enter') {
      const option = this.options()[this.active()];
      if (this.opened() && option && this.draft() === null) return this.choose(option.date);
      this.commit();
      return this.opened.set(false);
    }
    const count = this.options().length;
    const dir = key === 'ArrowDown' ? 1 : -1;
    this.active.update((i) => (i < 0 ? (dir > 0 ? 0 : count - 1) : (i + dir + count) % count));
  }

  protected reposition() {
    const field = this.field()?.nativeElement;
    const popup = this.popup()?.nativeElement;
    if (!field || !popup) return;
    this.fieldWidth.set(field.offsetWidth);
    this.position.set(anchorPosition(field, popup));
  }

  /** Clicks outside the component close the popup. composedPath() still holds nodes removed by the click */
  protected onDocumentClick(event: Event) {
    if (this.opened() && !event.composedPath().includes(this.host.nativeElement)) this.close();
  }
}
