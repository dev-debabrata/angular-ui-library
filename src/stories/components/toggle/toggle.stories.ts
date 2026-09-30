import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { ToggleComponent } from './toggle.component';

const meta: Meta<ToggleComponent> = {
  title: 'Components/Toggle',
  component: ToggleComponent,
  tags: ['autodocs'],
  args: {
    label: 'Enable notifications',
    checkedChange: fn(),
  },
};

export default meta;
type Story = StoryObj<ToggleComponent>;

export const Off: Story = {};

export const On: Story = { args: { checked: true } };

export const Disabled: Story = { args: { disabled: true } };
