import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SearchInputComponent } from './search-input.component';

const meta: Meta<SearchInputComponent> = {
  title: 'Components/Form/Search Input',
  component: SearchInputComponent,
  tags: ['autodocs'],
  args: {
    search: fn(),
  },
};

export default meta;
type Story = StoryObj<SearchInputComponent>;

export const Default: Story = { args: { placeholder: 'Search...' } };

export const WithValue: Story = { args: { value: 'Angular' } };

export const Disabled: Story = { args: { disabled: true } };
