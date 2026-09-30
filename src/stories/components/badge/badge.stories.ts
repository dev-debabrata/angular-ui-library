import type { Meta, StoryObj } from '@storybook/angular-vite';

import { TONES } from '../../types';
import { BadgeComponent } from './badge.component';

const meta: Meta<BadgeComponent> = {
  title: 'Components/Badge',
  component: BadgeComponent,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: TONES } },
  args: { label: 'New' },
};

export default meta;
type Story = StoryObj<BadgeComponent>;

export const Default: Story = {};

export const Pill: Story = { args: { label: '99+', pill: true } };

export const AllVariants: Story = {
  render: (args) => ({
    props: { ...args, tones: TONES },
    template: `
      <div style="display: flex; gap: 8px">
        @for (tone of tones; track tone) {
          <nex-badge [variant]="tone" [label]="tone" [pill]="pill" />
        }
      </div>
    `,
  }),
};
