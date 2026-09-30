import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SIZES } from '../../types';
import { SpinnerComponent } from './spinner.component';

const meta: Meta<SpinnerComponent> = {
  title: 'Components/Spinner',
  component: SpinnerComponent,
  tags: ['autodocs'],
  argTypes: { size: { control: 'select', options: SIZES } },
};

export default meta;
type Story = StoryObj<SpinnerComponent>;

export const Default: Story = {};

export const Small: Story = { args: { size: 'small' } };

export const Large: Story = { args: { size: 'large' } };

export const WithLabel: Story = { args: { label: 'Loading data...' } };
