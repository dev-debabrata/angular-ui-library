import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SIZES } from '../../../utils/types';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Form/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: { control: 'color' },
    size: { control: 'select', options: SIZES },
  },
  args: { label: 'Button', onClick: fn() },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = { args: { primary: true } };

export const Secondary: Story = {};

export const Large: Story = { args: { size: 'large' } };

export const Small: Story = { args: { size: 'small' } };
