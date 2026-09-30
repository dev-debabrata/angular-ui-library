import type { Meta, StoryObj } from '@storybook/angular-vite';

import { TONES } from '../../types';
import { ProgressBarComponent } from './progress-bar.component';

const meta: Meta<ProgressBarComponent> = {
  title: 'Components/Progress Bar',
  component: ProgressBarComponent,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    variant: { control: 'select', options: TONES },
  },
  args: { value: 40 },
};

export default meta;
type Story = StoryObj<ProgressBarComponent>;

export const Default: Story = {};

export const Complete: Story = { args: { value: 100, variant: 'success' } };

export const Warning: Story = { args: { value: 75, variant: 'warning' } };

export const WithoutLabel: Story = { args: { value: 60, showLabel: false } };
