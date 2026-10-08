import { signal } from '@angular/core';
import {
  type Meta,
  type StoryObj,
  componentWrapperDecorator,
  moduleMetadata,
} from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SIZES } from '../../../utils/types';
import { PAGINATION_VARIANTS } from '../pagination/pagination.component';
import { ButtonComponent } from '../../form/button/button.component';
import {
  TABLE_VARIANTS,
  TableComponent,
  type TableColumn,
  type TableLazyLoad,
  type TableRow,
} from './table.component';
import { ELEMENT_COLUMNS, ELEMENTS, PURCHASE_COLUMNS, PURCHASES } from './table-demo-data';
import { TableWrapperDemoComponent } from './table-wrapper-demo.component';
import { appearanceStories } from '../../../utils/appearance-stories';

/** Team members with a status and an avatar, for the richer examples */
const TEAM: { columns: TableColumn[]; data: TableRow[] } = {
  columns: [
    { key: 'name', label: 'Member', sortable: true, image: 'avatar' },
    { key: 'role', label: 'Role', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      tones: { Active: 'success', Invited: 'info', Away: 'warning', Suspended: 'danger' },
    },
    { key: 'projects', label: 'Projects', sortable: true, align: 'end' },
  ],
  data: [
    ['Amy Elsner', 'Admin', 'Active', 12],
    ['Bernardo Dominic', 'Editor', 'Away', 7],
    ['Anna Fali', 'Viewer', 'Invited', 0],
    ['Asiya Javayant', 'Editor', 'Active', 9],
    ['Elwin Sharvill', 'Admin', 'Suspended', 3],
    ['Ioni Bowcher', 'Viewer', 'Active', 4],
    ['Ivan Magalhaes', 'Editor', 'Active', 15],
    ['Xuxue Feng', 'Admin', 'Active', 21],
  ].map(([name, role, status, projects], i) => ({
    name,
    role,
    status,
    projects,
    avatar: `https://i.pravatar.cc/64?img=${i + 5}`,
  })),
};

const meta: Meta<TableComponent> = {
  title: 'Components/Data/Table',
  component: TableComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: TABLE_VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
    paginator: { control: 'select', options: PAGINATION_VARIANTS },
    sortOrder: { control: 'inline-radio', options: ['asc', 'desc'] },
  },
  args: {
    columns: [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', sortable: true },
    ],
    data: [
      { id: 1, name: 'Jane Doe', email: 'jane@example.com', role: 'Admin' },
      { id: 2, name: 'John Smith', email: 'john@example.com', role: 'Editor' },
      { id: 3, name: 'Alex Lee', email: 'alex@example.com', role: 'Viewer' },
      { id: 4, name: 'Sam Patel', email: 'sam@example.com', role: 'Editor' },
    ],
    rowClick: fn(),
    rowAction: fn(),
    selectionChange: fn(),
  },
};

export default meta;
type Story = StoryObj<TableComponent>;

export const Default: Story = {};

export const Striped: Story = { args: { variant: 'striped' } };

export const Bordered: Story = { args: { variant: 'bordered' } };

/** Every variant, with avatars (`image`), status pills (`tones`) and end-aligned numbers; glass sits on a gradient */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, ...TEAM, variants: TABLE_VARIANTS },
    template: `
      @for (v of variants; track v) {
        <code style="color: var(--ui-text-muted); font-size: 12px">{{ v }}</code>
        <div style="margin: 8px 0 28px; border-radius: var(--ui-radius-lg)" [style.padding]="v === 'glass' ? '24px' : null"
          [style.background]="v === 'glass' ? 'var(--ui-gradient)' : null">
          <np-table [variant]="v" [columns]="columns" [data]="data" (rowClick)="rowClick($event)" />
        </div>
      }
    `,
  }),
};

/** `size="small"` for dense data, `large` for comfortable reading */
export const Compact: Story = { args: { size: 'small', variant: 'striped' } };

/** `selectable` adds checkboxes; `[(selection)]` holds the selected rows, the header box selects all */
export const Selectable: Story = { args: { ...TEAM, selectable: true } };

/** `rows` pages the data with a built-in pagination bar ("Items per page" from `rowsOptions`, "1 – 5 of 8", arrows); works with sorting and the filter */
export const Paginated: Story = { args: { ...TEAM, rows: 5, filterable: true } };

/** `paginator` picks another pagination look for the bar, e.g. page numbers */
export const PaginatorPages: Story = { args: { ...TEAM, rows: 5, paginator: 'default' } };

/** `paginator="load-more"`: "Showing 3 of 8" and a button that adds the next rows below */
export const PaginatorLoadMore: Story = { args: { ...TEAM, rows: 3, paginator: 'load-more' } };

/** `scrollHeight` caps the height; the header stays pinned while rows scroll */
export const ScrollHeight: Story = { args: { ...TEAM, scrollHeight: '320px' } };

/** `loading` shows shimmering placeholder rows */
export const Loading: Story = { args: { columns: TEAM.columns, loading: true } };

export const WithFilter: Story = {
  args: { filterable: true, filterPlaceholder: 'Search users...' },
};

export const Empty: Story = { args: { data: [], emptyMessage: 'No users found' } };

/* ---- Material-style examples: elements of the periodic table and a shopping list ---- */

const WITH_BUTTONS = [moduleMetadata({ imports: [ButtonComponent] })];
const toolbar = (buttons: string) =>
  `<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px">${buttons}</div>`;

/** Drag and drop: `reorderable` moves rows by their grip (`[(data)]`, `rowReorder`), `reorderableColumns` moves columns by their header (`[(columns)]`, `columnReorder`) */
export const DragAndDrop: Story = {
  args: {
    columns: ELEMENT_COLUMNS,
    data: ELEMENTS.slice(0, 6),
    reorderable: true,
    reorderableColumns: true,
    rowReorder: fn(),
    columnReorder: fn(),
    dataChange: fn(),
    columnsChange: fn(),
  },
};

/** Adding and removing data: give `data` a new array and the table follows */
export const AddRemoveData: Story = {
  decorators: WITH_BUTTONS,
  render: () => {
    const rows = signal(ELEMENTS.slice(0, 5));
    return {
      props: {
        rows,
        columns: ELEMENT_COLUMNS,
        add: () =>
          rows.update((r) => [...r, { ...ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)] }]),
        remove: () => rows.update((r) => r.slice(0, -1)),
      },
      template: `${toolbar(`<np-button label="Add data" variant="soft" icon="plus" (clicked)="add()" />
  <np-button label="Remove data" variant="outlined" icon="minus" [disabled]="!rows().length" (clicked)="remove()" />`)}
<np-table [columns]="columns" [data]="rows()" />`,
    };
  },
};

/** Changing the columns shown: give `columns` a new array (add, remove or reorder them) */
export const DynamicColumns: Story = {
  decorators: WITH_BUTTONS,
  render: () => {
    const all: TableColumn[] = [...ELEMENT_COLUMNS, { key: 'description', label: 'About' }];
    const columns = signal(all.slice(0, 3));
    return {
      props: {
        columns,
        data: ELEMENTS.slice(0, 6),
        add: () => columns.update((c) => [...c, all.find((col) => !c.includes(col))!]),
        remove: () => columns.update((c) => c.slice(0, -1)),
        shuffle: () => columns.update((c) => [...c].sort(() => Math.random() - 0.5)),
      },
      template: `${toolbar(`<np-button label="Add column" variant="soft" icon="plus" [disabled]="columns().length === ${all.length}" (clicked)="add()" />
  <np-button label="Remove column" variant="outlined" icon="minus" [disabled]="columns().length < 2" (clicked)="remove()" />
  <np-button label="Shuffle" variant="outlined" icon="shuffle" (clicked)="shuffle()" />`)}
<np-table [columns]="columns()" [data]="data" />`,
    };
  },
};

/** `expandable`: click a row (or its ⌄ button) to open a detail row from the projected `<ng-template #rowDetail let-row>` (Web Components: `detailKey`) */
export const ExpandableRows: Story = {
  render: () => ({
    props: { columns: ELEMENT_COLUMNS, data: ELEMENTS.slice(0, 8) },
    template: `<np-table [columns]="columns" [data]="data" expandable>
  <ng-template #rowDetail let-row>
    <div style="display: flex; gap: 18px; align-items: flex-start">
      <div style="display: grid; min-width: 84px; padding: 8px 12px; border: 2px solid var(--ui-text); border-radius: var(--ui-radius-sm); line-height: 1.3">
        <small>{{ row.position }}</small>
        <b style="font-size: 30px">{{ row.symbol }}</b>
        <small>{{ row.name }}</small>
        <small>{{ row.weight }}</small>
      </div>
      <p style="margin: 0; color: var(--ui-text-muted)">{{ row.name }}: {{ row.description }}</p>
    </div>
  </ng-template>
</np-table>`,
  }),
};

/** A footer row: each column's `footer` is a value or a function of the rows (a total); `format` shows it as money */
export const FooterRow: Story = { args: { columns: PURCHASE_COLUMNS, data: PURCHASES } };

/** Multiple header and footer rows: column `description` adds a second header line, `footerNote` a row under the totals */
export const MultipleHeaderFooter: Story = {
  args: {
    columns: [
      { ...PURCHASE_COLUMNS[0], description: 'Name of the item purchased' },
      { ...PURCHASE_COLUMNS[1], description: 'Cost of the item in USD' },
    ],
    data: PURCHASES,
    footerNote: 'Please note that the costs of the items are completely made up.',
  },
};

/** 240 issues "on a server": the fake API below answers after 500 ms with one page, sorted and filtered there */
const ISSUES: TableRow[] = Array.from({ length: 240 }, (_, i) => ({
  created: new Date(Date.UTC(2026, 9, 8) - i * 9 * 3_600_000).toISOString(),
  state: i % 7 === 3 ? 'closed' : 'open',
  number: 34000 - i,
  title: [
    'fix(table): keep the sticky header above expanded rows',
    'feat(chart): add a radar type',
    'docs: explain lazy loading',
    'build: update dependencies',
    'fix(select): close on scroll',
    'feat(pagination): add a load-more look',
  ][i % 6],
}));

/** Data from a server: `lazy` makes `data` one page; sorting, the filter and paging emit `lazyLoad`, the app fetches and sets `data`, `totalRecords` and `loading` */
export const ServerData: Story = {
  render: () => {
    const rows = signal<TableRow[]>([]);
    const total = signal(0);
    const loading = signal(true);
    const load = ({ page, rows: size, sortField, sortOrder, filter }: TableLazyLoad) => {
      loading.set(true);
      setTimeout(() => {
        const q = filter.toLowerCase();
        const found = ISSUES.filter((r) => !q || String(r['title']).includes(q));
        if (sortField) {
          const dir = sortOrder === 'asc' ? 1 : -1;
          found.sort((a, b) => (a[sortField]! > b[sortField]! ? dir : -dir));
        }
        rows.set(found.slice((page - 1) * size, page * size));
        total.set(found.length);
        loading.set(false);
      }, 500);
    };
    const date = (v: unknown) =>
      new Date(String(v)).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    return {
      props: {
        rows,
        total,
        loading,
        load,
        columns: [
          { key: 'created', label: 'Created', sortable: true, format: date, width: '130px' },
          {
            key: 'state',
            label: 'State',
            tones: { open: 'success', closed: 'neutral' },
            width: '100px',
          },
          { key: 'number', label: '#', sortable: true, width: '90px' },
          { key: 'title', label: 'Title' },
        ],
      },
      template: `<np-table lazy filterable filterPlaceholder="Filter issues..." sortField="created" sortOrder="desc"
  scrollHeight="420px" [rows]="10" [rowsOptions]="[10, 30, 50]"
  [columns]="columns" [data]="rows()" [totalRecords]="total()" [loading]="loading()" (lazyLoad)="load($event)" />`,
    };
  },
};

/** Pagination with `showFirstLast`: first and last page buttons next to the arrows */
export const Pagination: Story = {
  args: { columns: ELEMENT_COLUMNS, data: ELEMENTS, rows: 5, showFirstLast: true },
};

/** Sorting: click a sortable header (again to reverse); `sortField` and `sortOrder` set the first sort */
export const Sorting: Story = {
  args: { columns: ELEMENT_COLUMNS, data: ELEMENTS.slice(0, 10), sortField: 'position' },
};

/** Sticky columns: `sticky: 'start'` (Name) and `'end'` (the row actions) stay in view while the table scrolls sideways; `actions` adds buttons that emit `rowAction` */
export const StickyColumns: Story = {
  args: {
    noWrap: true,
    scrollHeight: '320px',
    data: ELEMENTS,
    columns: [
      { key: 'name', label: 'Name', sticky: 'start', sortable: true },
      { key: 'position', label: 'No.' },
      { key: 'symbol', label: 'Symbol' },
      { key: 'weight', label: 'Weight', align: 'end' },
      { key: 'description', label: 'About' },
      {
        key: 'actions',
        label: 'Actions',
        sticky: 'end',
        actions: [
          { label: 'Edit', icon: 'pencil' },
          { label: 'Delete', icon: 'trash-2', danger: true },
        ],
      },
    ],
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="max-width: 620px">${story}</div>`),
  ],
};

/** A sticky footer: with `scrollHeight` and `stickyFooter`, the totals stay at the bottom while rows scroll */
export const StickyFooter: Story = {
  args: {
    columns: PURCHASE_COLUMNS,
    data: [...PURCHASES, ...PURCHASES.map((r) => ({ ...r }))],
    scrollHeight: '260px',
    stickyFooter: true,
  },
};

/** A sticky header: with `scrollHeight`, the header stays at the top while rows scroll */
export const StickyHeader: Story = {
  args: { columns: ELEMENT_COLUMNS, data: ELEMENTS, scrollHeight: '320px' },
};

/** Wrapping the table for reuse: `<np-elements-table [data]="rows" />` (table-wrapper-demo.component.ts) fixes the columns, sort and size once */
export const WrapperComponent: Story = {
  decorators: [moduleMetadata({ imports: [ButtonComponent, TableWrapperDemoComponent] })],
  render: () => {
    const rows = signal(ELEMENTS.slice(0, 5));
    return {
      props: {
        rows,
        clear: () => rows.set([]),
        add: () => rows.update((r) => [...r, { ...ELEMENTS[r.length % ELEMENTS.length] }]),
      },
      template: `${toolbar(`<np-button label="Clear table" variant="outlined" icon="trash-2" (clicked)="clear()" />
  <np-button label="Add data" variant="soft" icon="plus" (clicked)="add()" />`)}
<np-elements-table [data]="rows()" />`,
    };
  },
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default, 560);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
