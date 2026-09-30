import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { TableComponent } from './table.component';

const meta: Meta<TableComponent> = {
  title: 'Components/Table',
  component: TableComponent,
  tags: ['autodocs'],
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
  },
};

export default meta;
type Story = StoryObj<TableComponent>;

export const Default: Story = {};

export const Striped: Story = { args: { striped: true } };

export const Bordered: Story = { args: { bordered: true } };

export const WithFilter: Story = {
  args: {
    filterable: true,
    filterPlaceholder: 'Search users...',
  },
};

export const Empty: Story = {
  args: {
    data: [],
    emptyMessage: 'No users found',
  },
};
