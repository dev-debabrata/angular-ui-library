import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SIZES } from '../../../utils/types';
import { TABLE_VARIANTS, TableComponent, type TableColumn, type TableRow } from './table.component';
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

/** `rows` pages the data with a built-in pagination bar; works with sorting and the filter */
export const Paginated: Story = { args: { ...TEAM, rows: 5, filterable: true } };

/** `scrollHeight` caps the height; the header stays pinned while rows scroll */
export const ScrollHeight: Story = { args: { ...TEAM, scrollHeight: '320px' } };

/** `loading` shows shimmering placeholder rows */
export const Loading: Story = { args: { columns: TEAM.columns, loading: true } };

export const WithFilter: Story = {
  args: { filterable: true, filterPlaceholder: 'Search users...' },
};

export const Empty: Story = { args: { data: [], emptyMessage: 'No users found' } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
