import {
  CdkDrag,
  type CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  type TemplateRef,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import type { Size, Tone } from '../../../utils/types';
import { SearchInputComponent } from '../../form/search-input/search-input.component';
import { IconComponent } from '../../media/icon/icon.component';
import { PaginationComponent, type PaginationVariant } from '../pagination/pagination.component';

export type TableRow = Record<string, unknown>;

/** Sort order of two cell values: numbers by size, anything else as text */
const compare = (x: unknown, y: unknown) =>
  typeof x === 'number' && typeof y === 'number'
    ? x - y
    : String(x ?? '').localeCompare(String(y ?? ''));

/** A button in a column's cells (e.g. Edit, Delete); clicking it emits rowAction */
export interface TableRowAction {
  /** Name passed to rowAction, also the button's accessible name and tooltip */
  label: string;
  /** Icon file name */
  icon: string;
  /** Red on hover, for destructive actions */
  danger?: boolean;
}

export interface TableColumn {
  /** Property name in each row object */
  key: string;
  /** Text shown in the header cell */
  label: string;
  /** Second, smaller header line (e.g. what the column means) */
  description?: string;
  /** Can this column be sorted by clicking its header? */
  sortable?: boolean;
  /** Cell alignment, e.g. end for numbers */
  align?: 'start' | 'center' | 'end';
  /** Column width (any CSS length) */
  width?: string;
  /** Show the value as a status pill, colored by this value → tone map (other values are neutral) */
  tones?: Partial<Record<string, Tone>>;
  /** Property holding an image URL, shown as a round avatar before the value */
  image?: string;
  /** Turns the value into the text shown (e.g. a currency); also used for the footer value */
  format?: (value: unknown, row?: TableRow) => string;
  /** Footer cell: a value, or a function of all (filtered) rows, e.g. a total */
  footer?: string | number | ((rows: TableRow[]) => unknown);
  /** Keep the column in view while the table scrolls sideways: at the start or the end */
  sticky?: 'start' | 'end';
  /** Buttons shown in the cells instead of a value; a click emits rowAction */
  actions?: TableRowAction[];
}

/** What a lazy table asks for: load this page of rows, sorted and filtered like this */
export interface TableLazyLoad {
  page: number;
  rows: number;
  sortField: string | null;
  sortOrder: 'asc' | 'desc';
  filter: string;
}

/** Looks of the table */
export const TABLE_VARIANTS = [
  'default',
  'striped',
  'bordered',
  'minimal',
  'cards',
  'glass',
] as const;
export type TableVariant = (typeof TABLE_VARIANTS)[number];

@Component({
  selector: 'np-table',
  imports: [
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    IconComponent,
    NgTemplateOutlet,
    PaginationComponent,
    SearchInputComponent,
  ],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class TableComponent {
  /** Column definitions. Supports [(columns)] two-way binding (reorderableColumns writes the new order back) */
  readonly columns = model<TableColumn[]>([]);
  /** Rows to display. Supports [(data)] two-way binding (reorderable writes the new order back) */
  readonly data = model<TableRow[]>([]);
  /** Look: default, striped, bordered, minimal (no frame), cards (rows as separate cards) or glass (frosted) */
  readonly variant = input<TableVariant>('default');
  /** Row density: small (compact), medium or large (comfortable) */
  readonly size = input<Size>('medium');
  /** Alternate row background colors? */
  readonly striped = input(false, { transform: booleanAttribute });
  /** Show borders around every cell? */
  readonly bordered = input(false, { transform: booleanAttribute });
  /** Keep cells on one line; wide tables scroll sideways (pair with sticky columns) */
  readonly noWrap = input(false, { transform: booleanAttribute });
  /** Max height of the table (e.g. '320px'); rows scroll under a pinned header */
  readonly scrollHeight = input('');
  /** Keep the footer rows pinned to the bottom while rows scroll (with scrollHeight) */
  readonly stickyFooter = input(false, { transform: booleanAttribute });
  /** A note under the footer, as a last row across the table */
  readonly footerNote = input('');
  /** Show a checkbox column for selecting rows (the header box selects every filtered row) */
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Selected rows. Supports [(selection)] two-way binding */
  readonly selection = model<TableRow[]>([]);
  /** Drag rows by their handle to reorder them (updates [(data)], clears the sort) */
  readonly reorderable = input(false, { transform: booleanAttribute });
  /** Drag column headers to reorder the columns (updates [(columns)]) */
  readonly reorderableColumns = input(false, { transform: booleanAttribute });
  /** Rows open a detail row (click the row or its toggle): the projected <ng-template #rowDetail let-row>, or the detailKey property's text */
  readonly expandable = input(false, { transform: booleanAttribute });
  /** Property shown in the detail row when there's no rowDetail template (Web Components) */
  readonly detailKey = input('');
  /** Show shimmering placeholder rows instead of the data */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Rows per page; adds a pagination bar below the table (0 shows every row) */
  readonly rows = input(0, { transform: numberAttribute });
  /** "Items per page" choices of the pagination bar (empty: no select) */
  readonly rowsOptions = input<number[]>([5, 10, 25, 50]);
  /** Look of the pagination bar: compact ("Items per page", "1 – 5 of 40", arrows) or any pagination variant;
   * load-more adds rows below instead of turning pages */
  readonly paginator = input<PaginationVariant>('compact');
  /** First and last page buttons in the pagination bar */
  readonly showFirstLast = input(false, { transform: booleanAttribute });
  /** Column the rows are sorted by at first */
  readonly sortField = input<string | null>(null);
  /** Direction of the first sort */
  readonly sortOrder = input<'asc' | 'desc'>('asc');
  /** Data comes from a server: `data` is the current page only; sorting, filtering and paging emit lazyLoad */
  readonly lazy = input(false, { transform: booleanAttribute });
  /** Number of rows on the server, for the pagination bar (lazy) */
  readonly totalRecords = input(0, { transform: numberAttribute });
  /** Text shown when there are no rows */
  readonly emptyMessage = input('No data available');
  /** Show a search box that filters rows? */
  readonly filterable = input(false, { transform: booleanAttribute });
  /** Placeholder text for the search box */
  readonly filterPlaceholder = input('Filter rows...');
  /** Text shown when the filter matches no rows */
  readonly noResultsMessage = input('No matching results');
  /** Emits the row that was clicked */
  readonly rowClick = output<TableRow>();
  /** Emits a row action button's label and its row */
  readonly rowAction = output<{ action: string; row: TableRow }>();
  /** Emits the column indexes when a column is dragged to a new place */
  readonly columnReorder = output<{ previousIndex: number; currentIndex: number }>();
  /** Emits the data's indexes when a row is dragged to a new place */
  readonly rowReorder = output<{ previousIndex: number; currentIndex: number }>();
  /** Lazy: emits the page, sort and filter to load (on start and on every change) */
  readonly lazyLoad = output<TableLazyLoad>();

  /** The projected detail row template (expandable) */
  protected readonly detail = contentChild<TemplateRef<{ $implicit: TableRow }>>('rowDetail');

  protected readonly filterText = signal('');
  protected readonly sortKey = linkedSignal(() => this.sortField());
  protected readonly sortDirection = linkedSignal(() => this.sortOrder());
  /** Open detail rows */
  protected readonly expanded = signal(new Set<TableRow>());
  /** Rows per page: `rows`, until another size is picked in the pagination bar */
  protected readonly pageSize = linkedSignal(() => this.rows());
  /** The size choices, with the current size among them */
  protected readonly sizeOptions = computed(() =>
    this.rowsOptions().length
      ? [...new Set([...this.rowsOptions(), this.rows()])].sort((a, b) => a - b)
      : [],
  );
  /** Current page; back to 1 whenever the rows (lazy: the filter or sort) or the page size change */
  protected readonly page = linkedSignal({
    source: () => [
      this.lazy() ? [this.filterText(), this.sortKey(), this.sortDirection()] : this.filteredData(),
      this.pageSize(),
    ],
    computation: () => 1,
  });

  protected readonly filteredData = computed(() => {
    const query = this.filterText().trim().toLowerCase();
    const rows = this.data();
    if (!query || this.lazy()) {
      return rows;
    }
    const keys = this.columns().map((column) => column.key);
    return rows.filter((row) =>
      keys.some((key) =>
        String(row[key] ?? '')
          .toLowerCase()
          .includes(query),
      ),
    );
  });

  protected readonly sortedData = computed(() => {
    const key = this.sortKey();
    const rows = this.filteredData();
    if (!key || this.lazy()) {
      return rows;
    }
    const direction = this.sortDirection() === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => compare(a[key], b[key]) * direction);
  });

  /** All rows (lazy: on the server), and the ones on this page */
  protected readonly total = computed(() =>
    this.lazy() ? this.totalRecords() : this.sortedData().length,
  );
  protected readonly shown = computed(() => {
    const [rows, size, page] = [this.sortedData(), this.pageSize(), this.page()];
    if (!size || this.lazy()) return rows;
    return rows.slice(this.paginator() === 'load-more' ? 0 : (page - 1) * size, page * size);
  });

  /** How many of the filtered rows are selected */
  protected readonly selectedCount = computed(
    () => this.sortedData().filter((row) => this.selection().includes(row)).length,
  );

  /** Extra columns besides the data's: drag handle, checkbox, expand toggle */
  protected readonly span = computed(
    () =>
      this.columns().length +
      Number(this.reorderable()) +
      Number(this.selectable()) +
      Number(this.expandable()),
  );
  protected readonly skeletonCells = computed(() => Array.from({ length: this.span() }));
  protected readonly hasFooter = computed(() => this.columns().some((c) => c.footer !== undefined));

  /** Sticky columns' offsets from the table's start or end, in px, by column key (measured in the browser) */
  protected readonly offsets = signal<Record<string, number>>({});
  /** Each column's cell class and style: sticky side and offset, and alignment (centered for action buttons) */
  protected readonly cells = computed(() => {
    const offsets = this.offsets();
    return Object.fromEntries(
      this.columns().map(({ key, sticky, align, actions }) => [
        key,
        {
          class: sticky ? `sticky sticky--${sticky}` : '',
          style: {
            'text-align': align ?? (actions ? 'center' : null),
            [sticky === 'end' ? 'right' : 'left']: sticky ? `${offsets[key] ?? 0}px` : null,
          },
        },
      ]),
    );
  });
  private readonly layout = signal(0);
  private readonly tableEl = viewChild<ElementRef<HTMLTableElement>>('table');
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Lazy: ask for the page, sort and filter shown now
    effect(() => {
      if (!this.lazy()) return;
      const request: TableLazyLoad = {
        page: this.page(),
        rows: this.pageSize(),
        sortField: this.sortKey(),
        sortOrder: this.sortDirection(),
        filter: this.filterText(),
      };
      untracked(() => this.lazyLoad.emit(request));
    });

    // Sticky columns: measure the widths before and after each one when the table's size changes
    afterNextRender(() => {
      const table = this.tableEl()?.nativeElement;
      if (!table || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => this.layout.update((n) => n + 1));
      observer.observe(table);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
    afterRenderEffect(() => {
      this.layout();
      const columns = this.columns().filter((c) => c.sticky);
      const header = this.tableEl()?.nativeElement.tHead?.rows[0];
      if (!columns.length || !header) return;
      const widths = [...header.cells].map((cell) => cell.getBoundingClientRect().width);
      const keys = [...header.cells].map((cell) => cell.dataset['key']);
      const sum = (from: number, to: number) => widths.slice(from, to).reduce((a, b) => a + b, 0);
      const offsets: Record<string, number> = {};
      for (const column of columns) {
        const i = keys.indexOf(column.key);
        offsets[column.key] = Math.round(
          column.sticky === 'start' ? sum(0, i) : sum(i + 1, widths.length),
        );
      }
      if (JSON.stringify(offsets) !== JSON.stringify(untracked(this.offsets)))
        this.offsets.set(offsets);
    });
  }

  /**
   * A header click: ascending, then descending, then unsorted (like Material). Every click changes the order: when the
   * rows already ascend by the column, the first click sorts it descending
   */
  protected sortBy(key: string) {
    if (this.sortKey() === key) {
      if (this.sortDirection() === 'desc') this.sortKey.set(null);
      else this.sortDirection.set('desc');
      return;
    }
    const rows = this.filteredData();
    const ascends = rows.every((row, i) => !i || compare(rows[i - 1][key], row[key]) <= 0);
    this.sortKey.set(key);
    this.sortDirection.set(ascends && rows.length > 1 && !this.lazy() ? 'desc' : 'asc');
  }

  protected ariaSort(key: string) {
    if (this.sortKey() !== key) return null;
    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  /** Selects (on) or unselects the given rows */
  protected select(rows: TableRow[], on: boolean) {
    const others = this.selection().filter((row) => !rows.includes(row));
    this.selection.set(on ? [...others, ...rows] : others);
  }

  protected toggle(row: TableRow) {
    this.expanded.update((open) => {
      const next = new Set(open);
      if (!next.delete(row)) next.add(row);
      return next;
    });
  }

  /** The text of a cell (or a footer cell, without a row) */
  protected text(column: TableColumn, value: unknown, row?: TableRow) {
    return column.format ? column.format(value, row) : (value ?? '');
  }

  protected footerValue(column: TableColumn) {
    const { footer } = column;
    const value = typeof footer === 'function' ? footer(this.sortedData()) : footer;
    return value === undefined ? '' : this.text(column, value);
  }

  /** Drop: moves the row in `data` (shown positions mapped to the data's), and shows that order */
  protected drop(event: CdkDragDrop<unknown>) {
    const shown = this.shown();
    const data = [...this.data()];
    const previousIndex = data.indexOf(shown[event.previousIndex]);
    const currentIndex = data.indexOf(shown[event.currentIndex]);
    if (previousIndex < 0 || previousIndex === currentIndex) return;
    moveItemInArray(data, previousIndex, currentIndex);
    this.sortKey.set(null);
    this.data.set(data);
    this.rowReorder.emit({ previousIndex, currentIndex });
  }

  protected dropColumn({ previousIndex, currentIndex }: CdkDragDrop<unknown>) {
    if (previousIndex === currentIndex) return;
    const columns = [...this.columns()];
    moveItemInArray(columns, previousIndex, currentIndex);
    this.columns.set(columns);
    this.columnReorder.emit({ previousIndex, currentIndex });
  }

  /** A row click: emits rowClick, and opens or closes the row's details (expandable) */
  protected clickRow(row: TableRow) {
    this.rowClick.emit(row);
    if (this.expandable()) this.toggle(row);
  }

  protected act(event: Event, action: TableRowAction, row: TableRow) {
    event.stopPropagation();
    this.rowAction.emit({ action: action.label, row });
  }
}
