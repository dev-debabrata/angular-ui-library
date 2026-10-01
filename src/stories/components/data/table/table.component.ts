import { Component, booleanAttribute, computed, input, output, signal } from '@angular/core';

import { SearchInputComponent } from '../../form/search-input/search-input.component';

export interface TableColumn {
  /** Property name in each row object */
  key: string;
  /** Text shown in the header cell */
  label: string;
  /** Can this column be sorted by clicking its header? */
  sortable?: boolean;
}

export type TableRow = Record<string, unknown>;

@Component({
  selector: 'nex-table',
  imports: [SearchInputComponent],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class TableComponent {
  /** Column definitions */
  readonly columns = input<TableColumn[]>([]);

  /** Rows to display */
  readonly data = input<TableRow[]>([]);

  /** Alternate row background colors? */
  readonly striped = input(false, { transform: booleanAttribute });

  /** Show borders around every cell? */
  readonly bordered = input(false, { transform: booleanAttribute });

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
}
