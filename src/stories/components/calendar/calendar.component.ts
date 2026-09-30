import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  signal,
  type OnInit,
  viewChild,
} from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { TimePickerComponent, formatTime } from '../time-picker/time-picker.component';
import { type AnchorPosition, anchorPosition } from '../../anchor-position';

/** Single: a Date. Multiple: Date[]. Range: [start, end | null] */
export type CalendarValue = Date | (Date | null)[] | null;
export type CalendarSelectionMode = 'single' | 'multiple' | 'range';
export type CalendarView = 'date' | 'month' | 'year';

interface DayCell {
  date: Date;
  key: number;
  label: string;
  otherMonth: boolean;
  /** Other-month days are left blank when several months are shown */
  hidden: boolean;
  today: boolean;
  selected: boolean;
  disabled: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  inRange: boolean;
}

/** A month (month grid) or a year (year grid). `date` is what picking it selects or drills into */
interface PickerCell {
  date: Date;
  label: string;
  selected: boolean;
  current: boolean;
  disabled: boolean;
  muted: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');
const monthName = (month: number, style: 'long' | 'short') =>
  new Date(2000, month, 1).toLocaleDateString(undefined, { month: style });

/** Comparable number for the calendar day of `d` (ignores time) */
const dayKey = (d: Date) => d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** First day of the month `n` months after `d` */
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
/** Same day of month `n` months later, clamped to the month's length */
const shiftMonth = (d: Date, n: number) =>
  new Date(
    d.getFullYear(),
    d.getMonth() + n,
    Math.min(d.getDate(), addDays(addMonths(d, n + 1), -1).getDate()),
  );
const withTime = (d: Date, t: Date | null) =>
  t ? new Date(new Date(d).setHours(t.getHours(), t.getMinutes(), t.getSeconds(), 0)) : d;

/**
 * Format `date` with tokens: d / dd (day), m / mm (month number), M / MM (short / full month name), yy (4-digit year).
 * Anything else is copied as is, e.g. formatDate(date, 'dd M yy') -> "05 Sep 2026".
 */
export function formatDate(date: Date, format = 'dd/mm/yy'): string {
  const m = date.getMonth();
  const tokens: Record<string, string> = {
    yy: String(date.getFullYear()),
    MM: monthName(m, 'long'),
    M: monthName(m, 'short'),
    mm: pad(m + 1),
    m: String(m + 1),
    dd: pad(date.getDate()),
    d: String(date.getDate()),
  };
  return format.replace(/yy|MM|M|mm|m|dd|d/g, (token) => tokens[token]);
}

let nextId = 0;

@Component({
  selector: 'nex-calendar',
  imports: [IconComponent, TimePickerComponent],
  host: {
    '(document:keydown.escape)': 'close(true)',
    '(document:click)': 'onDocumentClick($event)',
    '(focusout)': 'onFocusOut($event)',
    '(window:resize)': 'reposition()',
    '(window:scroll)': 'reposition()',
  },
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class CalendarComponent implements OnInit {
  /** Selected date(s). Single: Date, multiple: Date[], range: [start, end | null]. Supports [(value)] */
  readonly value = model<CalendarValue>(null);

  /** Pick one date, several dates, or a start/end range */
  readonly selectionMode = input<CalendarSelectionMode>('single');

  /** Show the calendar panel directly instead of an input with a popup */
  readonly inline = input(false, { transform: booleanAttribute });

  /** Earliest selectable date */
  readonly minDate = input<Date | null>(null);

  /** Latest selectable date */
  readonly maxDate = input<Date | null>(null);

  /** Dates that cannot be selected */
  readonly disabledDates = input<Date[]>([]);

  /** Weekdays that cannot be selected (0 = Sunday … 6 = Saturday) */
  readonly disabledDays = input<number[]>([]);

  /** First column of the week (0 = Sunday, 1 = Monday) */
  readonly firstDayOfWeek = input(0, { transform: numberAttribute });

  /** Show a time picker under the grid (single selection only) */
  readonly showTime = input(false, { transform: booleanAttribute });

  /** Clock used by the time picker and the input text */
  readonly hourFormat = input<'12' | '24'>('24');

  /** Show Today and Clear buttons under the grid */
  readonly showButtonBar = input(false, { transform: booleanAttribute });

  /** What is picked: a day, a month (month picker) or a year (year picker) */
  readonly view = input<CalendarView>('date');

  /** Input text format. Tokens: d, dd, m, mm, M, MM, yy */
  readonly dateFormat = input('dd/mm/yy');

  /** Text shown in the input when nothing is selected */
  readonly placeholder = input('');

  /** Text shown above the input */
  readonly label = input('');

  /** Is the calendar disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Show a calendar button inside the input */
  readonly showIcon = input(false, { transform: booleanAttribute });

  /** Months shown side by side */
  readonly numberOfMonths = input(1, { transform: numberAttribute });

  /** Emits the clicked date */
  readonly select = output<Date>();

  /** Emits when the Clear button empties the value */
  readonly clear = output<void>();

  /** Emits when the shown month changes (month is 0-11) */
  readonly monthChange = output<{ month: number; year: number }>();

  protected readonly id = `nex-calendar-${nextId++}`;
  protected readonly opened = signal(false);
  protected readonly position = signal<AnchorPosition | null>(null);
  /** First day of the first month on screen */
  protected readonly viewDate = signal(addMonths(new Date(), 0));
  /** Grid being shown: days, months or years. Starts at `view` and drills up via the header */
  protected readonly currentView = linkedSignal(() => this.view());
  /** Day under the mouse, used to preview the end of a range */
  protected readonly hoverDate = signal<Date | null>(null);
  /** Day that owns keyboard focus (roving tabindex) */
  private readonly focusDate = signal<Date | null>(null);
  /** Time picked before any date was selected */
  private readonly time = signal<Date | null>(null);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly field = viewChild<ElementRef<HTMLElement>>('field');
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private skipFocusOpen = false;

  private readonly count = computed(() => Math.max(1, Math.floor(this.numberOfMonths())));

  /** [minDate, maxDate] as day keys, open-ended when unset */
  private readonly bounds = computed(() => {
    const [min, max] = [this.minDate(), this.maxDate()];
    return [min ? dayKey(min) : -Infinity, max ? dayKey(max) : Infinity];
  });

  private readonly selectedDates = computed(() => {
    const v = this.value();
    return (Array.isArray(v) ? v : [v]).filter((d): d is Date => d instanceof Date);
  });

  protected readonly timeValue = computed(() => {
    const v = this.value();
    return v instanceof Date ? v : this.time();
  });

  protected readonly text = computed(() => {
    const v = this.value();
    const withClock = this.showTime() && this.selectionMode() === 'single';
    const fmt = (d: Date | null | undefined) =>
      !d
        ? ''
        : formatDate(d, this.dateFormat()) +
          (withClock ? ' ' + formatTime(d, this.hourFormat()) : '');
    if (!Array.isArray(v)) return fmt(v);
    if (this.selectionMode() === 'range') return v[0] ? `${fmt(v[0])} - ${fmt(v[1])}` : '';
    return v.map(fmt).filter(Boolean).join(', ');
  });

  protected readonly weekdays = computed(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2024, 0, 7 + ((i + this.firstDayOfWeek()) % 7)); // Jan 7 2024 is a Sunday
      return {
        short: d.toLocaleDateString(undefined, { weekday: 'short' }),
        long: d.toLocaleDateString(undefined, { weekday: 'long' }),
      };
    }),
  );

  /** Day grids (6 weeks each) for every month on screen */
  protected readonly months = computed(() => {
    const todayKey = dayKey(new Date());
    const selected = new Set(this.selectedDates().map(dayKey));
    // Range band as day keys; the end falls back to the hovered day while picking
    const v = this.value();
    const [from, to] = this.selectionMode() === 'range' && Array.isArray(v) ? v : [];
    const hover = this.hoverDate();
    const start = from ? dayKey(from) : 0;
    const end = !from ? 0 : to ? dayKey(to) : hover && dayKey(hover) > start ? dayKey(hover) : 0;
    const band = !!end && end !== start;
    return Array.from({ length: this.count() }, (_, i) => {
      const first = addMonths(this.viewDate(), i);
      const gridStart = addDays(first, -((first.getDay() - this.firstDayOfWeek() + 7) % 7));
      const weeks = Array.from({ length: 6 }, (_, w) =>
        Array.from({ length: 7 }, (_, d): DayCell => {
          const date = addDays(gridStart, w * 7 + d);
          const key = dayKey(date);
          const otherMonth = date.getMonth() !== first.getMonth();
          const hidden = otherMonth && this.count() > 1;
          const inBand = band && !hidden;
          return {
            date,
            key,
            label: date.toLocaleDateString(undefined, { dateStyle: 'full' }),
            otherMonth,
            hidden,
            today: key === todayKey,
            selected: selected.has(key),
            disabled: this.isDisabled(date),
            rangeStart: inBand && key === start,
            rangeEnd: inBand && key === end,
            inRange: inBand && key > start && key < end,
          };
        }),
      );
      return {
        key: first.getTime(),
        year: first.getFullYear(),
        monthLabel: monthName(first.getMonth(), 'long'),
        weeks,
      };
    });
  });

  protected readonly decadeStart = computed(() => {
    const year = this.viewDate().getFullYear();
    return year - (year % 10);
  });

  /** Month grid: the 12 months of the shown year. Year grid: a decade plus a muted year on each side */
  protected readonly pickerCells = computed(() => {
    const months = this.currentView() === 'month';
    const view = this.viewDate();
    const today = new Date();
    return Array.from({ length: 12 }, (_, i): PickerCell => {
      const year = months ? view.getFullYear() : this.decadeStart() - 1 + i;
      const match = (d: Date) => d.getFullYear() === year && (!months || d.getMonth() === i);
      return {
        // Picking a year selects Jan 1 (year picker) or drills into the same month of that year
        date: new Date(year, months ? i : this.view() === 'year' ? 0 : view.getMonth(), 1),
        label: months ? monthName(i, 'short') : String(year),
        selected: this.selectedDates().some(match),
        current: match(today),
        disabled: this.outOfBounds(
          new Date(year, months ? i : 0, 1),
          new Date(year, months ? i + 1 : 12, 0),
        ),
        muted: !months && (i === 0 || i === 11),
      };
    });
  });

  /** Day with tabindex=0: the focused day, else the selection, else today, else the 1st, whichever is on screen */
  protected readonly activeKey = computed(() => {
    const first = this.viewDate();
    const end = addMonths(first, this.count());
    const onScreen = (d: Date | null | undefined): d is Date => !!d && d >= first && d < end;
    const active = [this.focusDate(), this.selectedDates()[0], new Date()].find(onScreen);
    return dayKey(active ?? first);
  });

  protected readonly prevDisabled = computed(
    () => this.currentView() === 'date' && dayKey(addDays(this.viewDate(), -1)) < this.bounds()[0],
  );

  protected readonly nextDisabled = computed(
    () =>
      this.currentView() === 'date' &&
      dayKey(addMonths(this.viewDate(), this.count())) > this.bounds()[1],
  );

  constructor() {
    // Measure and place the popup when it opens
    effect(() => {
      this.position.set(null);
      if (!this.inline() && this.panel()) this.reposition();
    });
  }

  ngOnInit() {
    this.syncView();
  }

  protected isDisabled(date: Date) {
    const key = dayKey(date);
    return (
      this.outOfBounds(date, date) ||
      this.disabledDays().includes(date.getDay()) ||
      this.disabledDates().some((d) => dayKey(d) === key)
    );
  }

  /** Is the whole span [from, to] before minDate or after maxDate? */
  private outOfBounds(from: Date, to: Date) {
    const [min, max] = this.bounds();
    return dayKey(to) < min || dayKey(from) > max;
  }

  /** Show the month of the selection (or today) at the picker's own level */
  private syncView() {
    this.viewDate.set(addMonths(this.selectedDates()[0] ?? new Date(), 0));
    this.currentView.set(this.view());
    this.focusDate.set(null);
  }

  private setViewDate(date: Date) {
    const month = addMonths(date, 0);
    if (month.getTime() === this.viewDate().getTime()) return;
    this.viewDate.set(month);
    this.monthChange.emit({ month: month.getMonth(), year: month.getFullYear() });
  }

  /** Previous (-1) or next (1) page: a month, a year or a decade depending on the grid */
  protected navigate(dir: 1 | -1) {
    const months = { date: 1, month: 12, year: 120 }[this.currentView()];
    this.setViewDate(addMonths(this.viewDate(), dir * months));
  }

  protected selectDate(date: Date) {
    const mode = this.selectionMode();
    if (mode === 'single') {
      const picked = this.showTime() ? withTime(date, this.timeValue()) : date;
      this.value.set(picked);
      this.select.emit(picked);
      if (!this.showTime()) this.close(true);
      return;
    }
    if (mode === 'multiple') {
      const list = this.selectedDates();
      const existing = list.find((d) => dayKey(d) === dayKey(date));
      this.value.set(
        existing ? list.filter((d) => d !== existing) : [...list, date].sort((a, b) => +a - +b),
      );
    } else {
      const v = this.value();
      const [start, end] = Array.isArray(v) ? v : [];
      if (!start || end || dayKey(date) < dayKey(start)) this.value.set([date, null]);
      else {
        this.value.set([start, date]);
        this.close(true);
      }
    }
    this.select.emit(date);
  }

  protected pickDay(cell: DayCell) {
    if (cell.disabled) return;
    this.focusDate.set(cell.date);
    this.selectDate(cell.date);
  }

  /** Select the month/year at the picker's own level, else drill down one level */
  protected pickCell({ date }: PickerCell) {
    const current = this.currentView();
    if (current === this.view()) return this.selectDate(date);
    this.setViewDate(date);
    this.currentView.set(current === 'month' ? 'date' : 'month');
  }

  protected hover(date: Date) {
    if (this.selectionMode() === 'range') this.hoverDate.set(date);
  }

  protected onTime(time: Date | null) {
    this.time.set(time);
    const v = this.value();
    if (time && v instanceof Date) this.value.set(withTime(v, time));
  }

  protected selectToday() {
    const now = new Date();
    const view = this.view();
    const date =
      view === 'date'
        ? addDays(now, 0)
        : new Date(now.getFullYear(), view === 'month' ? now.getMonth() : 0, 1);
    this.setViewDate(date);
    this.currentView.set(view);
    if (view !== 'date' || !this.isDisabled(date)) this.selectDate(date);
  }

  protected clearValue() {
    this.value.set(null);
    this.clear.emit();
    this.close(true);
  }

  protected onDayKeydown(event: KeyboardEvent, cell: DayCell) {
    const { key } = event;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      return this.pickDay(cell);
    }
    const d = cell.date;
    const fromWeekStart = (d.getDay() - this.firstDayOfWeek() + 7) % 7;
    const days: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -fromWeekStart,
      End: 6 - fromWeekStart,
    };
    const months = ({ PageUp: -1, PageDown: 1 } as Record<string, number>)[key];
    if (key in days) this.moveFocus(addDays(d, days[key]));
    else if (months) this.moveFocus(shiftMonth(d, event.shiftKey ? months * 12 : months));
    else return;
    event.preventDefault();
  }

  /** Focus `date`, paging the view if it is off screen */
  private moveFocus(date: Date) {
    const first = this.viewDate();
    if (date < first) this.setViewDate(date);
    else if (date >= addMonths(first, this.count()))
      this.setViewDate(addMonths(date, 1 - this.count()));
    this.focusDate.set(date);
    this.hover(date);
    this.focusActiveDay();
  }

  private focusActiveDay() {
    afterNextRender(
      () =>
        this.panel()
          ?.nativeElement.querySelector<HTMLElement>('.calendar-day[tabindex="0"]')
          ?.focus(),
      { injector: this.injector },
    );
  }

  protected onInputFocus() {
    if (!this.skipFocusOpen) this.open();
  }

  protected onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'Enter') {
      event.preventDefault();
      this.open();
      if (this.currentView() === 'date') this.focusActiveDay();
    }
  }

  protected open() {
    if (this.disabled() || this.inline() || this.opened()) return;
    this.syncView();
    this.opened.set(true);
  }

  protected toggle() {
    return this.opened() ? this.close(true) : this.open();
  }

  /** Close the popup; `refocus` moves focus back to the input without reopening it */
  protected close(refocus = false) {
    if (!this.opened()) return;
    this.opened.set(false);
    this.hoverDate.set(null);
    if (refocus) {
      this.skipFocusOpen = true;
      this.input()?.nativeElement.focus();
      this.skipFocusOpen = false;
    }
  }

  protected reposition() {
    const field = this.field()?.nativeElement;
    const panel = this.panel()?.nativeElement;
    if (this.opened() && field && panel) this.position.set(anchorPosition(field, panel));
  }

  /** Clicks outside close the popup. composedPath() still holds nodes the click removed (e.g. a drilled-up grid) */
  protected onDocumentClick(event: Event) {
    if (this.opened() && !event.composedPath().includes(this.host.nativeElement)) this.close();
  }

  /** Tabbing out of the component closes the popup */
  protected onFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (next && !this.host.nativeElement.contains(next)) this.close();
  }
}
