import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SelectComponent } from './select.component';

const meta: Meta<SelectComponent> = {
  title: 'Components/Form/Select',
  component: SelectComponent,
  tags: ['autodocs'],
  args: {
    label: 'Role',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' },
    ],
    valueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<SelectComponent>;

export const Default: Story = {};

export const WithValue: Story = { args: { value: 'editor' } };

export const Disabled: Story = { args: { value: 'viewer', disabled: true } };
