import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { BreadcrumbComponent } from './breadcrumb.component';

const meta: Meta<BreadcrumbComponent> = {
  title: 'Components/Menu/Breadcrumb',
  component: BreadcrumbComponent,
  tags: ['autodocs'],
  args: {
    items: [
      { label: 'Home' },
      { label: 'Products' },
      { label: 'Laptops' },
      { label: 'MacBook Pro' },
    ],
    itemClick: fn(),
  },
};

export default meta;
type Story = StoryObj<BreadcrumbComponent>;

export const Default: Story = {};

export const CustomSeparator: Story = { args: { separator: '›' } };
