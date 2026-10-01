import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { ChipComponent } from './chip.component';

const meta: Meta<ChipComponent> = {
  title: 'Components/Form/Chip',
  component: ChipComponent,
  tags: ['autodocs'],
  args: { label: 'Angular', remove: fn() },
};

export default meta;
type Story = StoryObj<ChipComponent>;

export const Default: Story = {};

export const WithIcon: Story = { args: { label: 'Jane Doe', icon: 'user' } };

export const WithImage: Story = {
  args: { label: 'Amy Elsner', image: 'https://i.pravatar.cc/64?img=5' },
};

export const Removable: Story = { args: { label: 'Removable', removable: true } };

export const Disabled: Story = { args: { label: 'Disabled', removable: true, disabled: true } };

export const Group: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px; max-width: 420px">
        <nex-chip label="Action" />
        <nex-chip label="Comedy" icon="sparkles" />
        <nex-chip label="Favorites" icon="heart" [removable]="true" (remove)="remove($event)" />
        <nex-chip label="Amy Elsner" image="https://i.pravatar.cc/64?img=5" [removable]="true" (remove)="remove($event)" />
        <nex-chip label="Asiya Javayant" image="https://i.pravatar.cc/64?img=9" />
        <nex-chip label="Fast" icon="zap" [removable]="true" (remove)="remove($event)" />
        <nex-chip label="Archived" [disabled]="true" [removable]="true" />
      </div>
    `,
  }),
};
