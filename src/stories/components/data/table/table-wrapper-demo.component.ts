import { Component, input } from '@angular/core';

import { TableComponent, type TableRow } from './table.component';
import { ELEMENT_COLUMNS } from './table-demo-data';

/**
 * Story-only helper: how to wrap np-table for reuse. The wrapper fixes the columns, sorting and look once, so pages
 * only pass the rows: <np-elements-table [data]="rows" />. Not part of the library.
 */
@Component({
  selector: 'np-elements-table',
  imports: [TableComponent],
  templateUrl: './table-wrapper-demo.html',
  styleUrl: './table-wrapper-demo.css',
})
export class TableWrapperDemoComponent {
  /** The elements to list */
  readonly data = input<TableRow[]>([]);

  protected readonly columns = ELEMENT_COLUMNS;
}
