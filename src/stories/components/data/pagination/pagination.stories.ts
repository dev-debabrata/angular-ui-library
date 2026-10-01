import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { PaginationComponent } from './pagination.component';

const meta: Meta<PaginationComponent> = {
  title: 'Components/Data/Pagination',
  component: PaginationComponent,
  tags: ['autodocs'],
  args: {
    pageChange: fn(),
  },
};

export default meta;
type Story = StoryObj<PaginationComponent>;

export const Default: Story = { args: { page: 1, totalPages: 5 } };

export const ManyPages: Story = { args: { page: 10, totalPages: 20 } };

export const LastPage: Story = { args: { page: 20, totalPages: 20 } };
