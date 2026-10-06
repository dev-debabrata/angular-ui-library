import {
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
  output,
  linkedSignal,
  signal,
} from '@angular/core';

import type { Size, Tone } from '../../../utils/types';
import { SearchInputComponent } from '../../form/search-input/search-input.component';
import { IconComponent } from '../../media/icon/icon.component';
import { PaginationComponent } from '../pagination/pagination.component';

export interface TableColumn {
  /** Property name in each row object */
  key: string;
  /** Text shown in the header cell */
  label: string;
  /** Can this column be sorted by clicking its header? */
  sortable?: boolean;
  /** Cell alignment, e.g. end for numbers */
  align?: 'start' | 'center' | 'end';
  /** Show the value as a status pill, colored by this value → tone map (other values are neutral) */
  tones?: Partial<Record<string, Tone>>;
  /** Property holding an image URL, shown as a round avatar before the value */
  image?: string;
}

export type TableRow = Record<string, unknown>;

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
  imports: [SearchInputComponent, IconComponent, PaginationComponent],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class TableComponent {
  /** Column definitions */
  readonly columns = input<TableColumn[]>([]);
  /** Rows to display */
  readonly data = input<TableRow[]>([]);
  /** Look: default, striped, bordered, minimal (no frame), cards (rows as separate cards) or glass (frosted) */
  readonly variant = input<TableVariant>('default');
  /** Row density: small (compact), medium or large (comfortable) */
  readonly size = input<Size>('medium');
  /** Alternate row background colors? */
  readonly striped = input(false, { transform: booleanAttribute });
  /** Show borders around every cell? */
  readonly bordered = input(false, { transform: booleanAttribute });
  /** Max height of the table (e.g. '320px'); rows scroll under a pinned header */
  readonly scrollHeight = input('');
  /** Show a checkbox column for selecting rows (the header box selects every filtered row) */
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Selected rows. Supports [(selection)] two-way binding */
  readonly selection = model<TableRow[]>([]);
  /** Show shimmering placeholder rows instead of the data */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Rows per page; adds a pagination bar below the table (0 shows every row) */
  readonly rows = input(0, { transform: numberAttribute });
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

  protected readonly filterText = signal('');
  protected readonly sortKey = signal<string | null>(null);
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');
  /** Current page; back to 1 whenever the filtered rows or the page size change */
  protected readonly page = linkedSignal({
    source: () => [this.filteredData(), this.rows()],
    computation: () => 1,
  });

  protected readonly filteredData = computed(() => {
    const query = this.filterText().trim().toLowerCase();
    const rows = this.data();
    if (!query) {
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
    if (!key) {
      return rows;
    }
    const direction = this.sortDirection() === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = a[key];
      const y = b[key];
      if (typeof x === 'number' && typeof y === 'number') {
        return (x - y) * direction;
      }
      return String(x ?? '').localeCompare(String(y ?? '')) * direction;
    });
  });

  /** How many of the filtered rows are selected */
  protected readonly selectedCount = computed(
    () => this.sortedData().filter((row) => this.selection().includes(row)).length,
  );

  protected sortBy(key: string) {
    if (this.sortKey() === key) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDirection.set('asc');
    }
  }

  protected ariaSort(key: string) {
    if (this.sortKey() !== key) {
      return null;
    }
    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  /** Selects (on) or unselects the given rows */
  protected select(rows: TableRow[], on: boolean) {
    const others = this.selection().filter((row) => !rows.includes(row));
    this.selection.set(on ? [...others, ...rows] : others);
  }
}
