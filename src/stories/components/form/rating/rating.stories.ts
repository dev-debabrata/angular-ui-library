import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { RatingComponent } from './rating.component';

const meta: Meta<RatingComponent> = {
  title: 'Components/Form/Rating',
  component: RatingComponent,
  tags: ['autodocs'],
  args: {
    valueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<RatingComponent>;

export const Default: Story = { args: { value: 0 } };

export const WithValue: Story = { args: { value: 3 } };

export const TenStars: Story = { args: { value: 7, max: 10 } };

export const ReadOnly: Story = { args: { value: 4, readonly: true } };
