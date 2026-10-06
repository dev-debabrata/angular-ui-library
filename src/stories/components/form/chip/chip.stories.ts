import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SIZES, TONES } from '../../../utils/types';
import { CHIP_VARIANTS, ChipComponent } from './chip.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<ChipComponent> = {
  title: 'Components/Form/Chip',
  component: ChipComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: CHIP_VARIANTS },
    tone: { control: 'select', options: ['', ...TONES] },
    size: { control: 'inline-radio', options: SIZES },
  },
  args: { label: 'Angular', remove: fn(), selectedChange: fn() },
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

/** Every variant, with an icon and a remove button */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: CHIP_VARIANTS },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 10px; max-width: 560px">
        @for (v of variants; track v) {
          <np-chip [variant]="v" [label]="v" icon="sparkles" [removable]="true" (remove)="remove($event)" />
        }
      </div>
    `,
  }),
};

/** `tone` colors the soft, outlined, solid, gradient and dot variants */
export const Tones: Story = {
  render: (args) => ({
    props: { ...args, tones: TONES, variants: ['soft', 'outlined', 'solid', 'dot'] },
    template: `
      <div style="display: grid; gap: 12px">
        @for (v of variants; track v) {
          <div style="display: flex; flex-wrap: wrap; gap: 8px">
            @for (t of tones; track t) {
              <np-chip [variant]="v" [tone]="t" [label]="t" />
            }
          </div>
        }
      </div>
    `,
  }),
};

/** Status chips: the `dot` variant, with `pulse` for live states */
export const Status: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <np-chip variant="dot" tone="success" label="Live" pulse />
        <np-chip variant="dot" tone="warning" label="Degraded" />
        <np-chip variant="dot" tone="danger" label="Offline" />
        <np-chip variant="dot" tone="neutral" label="Draft" />
      </div>
    `,
  }),
};

/** `selectable` chips toggle with `[(selected)]` and show a check mark; `count` adds a pill after the label */
export const Selectable: Story = {
  render: (args) => ({
    props: {
      ...args,
      filters: [
        { label: 'Design', count: 12, selected: true },
        { label: 'Engineering', count: 34, selected: false },
        { label: 'Marketing', count: 8, selected: true },
      ],
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        @for (f of filters; track f.label) {
          <np-chip variant="outlined" selectable [label]="f.label" [count]="f.count"
            [(selected)]="f.selected" (selectedChange)="selectedChange($event)" />
        }
      </div>
    `,
  }),
};

/** Frosted chips over a colorful background */
export const Glass: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 32px; border-radius: 16px;
        background: linear-gradient(135deg, #6366f1, #a855f7 50%, #ec4899)">
        <np-chip variant="glass" label="Travel" icon="plane" />
        <np-chip variant="glass" label="Photography" icon="camera" />
        <np-chip variant="glass" label="Amy Elsner" image="https://i.pravatar.cc/64?img=5" removable />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: (args) => ({
    props: { ...args, sizes: SIZES },
    template: `
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
        @for (s of sizes; track s) {
          <np-chip variant="soft" [size]="s" [label]="s" icon="tag" removable />
        }
      </div>
    `,
  }),
};

export const Group: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px; max-width: 420px">
        <np-chip label="Action" />
        <np-chip label="Comedy" icon="sparkles" />
        <np-chip label="Favorites" icon="heart" [removable]="true" (remove)="remove($event)" />
        <np-chip label="Amy Elsner" image="https://i.pravatar.cc/64?img=5" [removable]="true" (remove)="remove($event)" />
        <np-chip label="Asiya Javayant" image="https://i.pravatar.cc/64?img=9" />
        <np-chip label="Fast" icon="zap" [removable]="true" (remove)="remove($event)" />
        <np-chip label="Archived" [disabled]="true" [removable]="true" />
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
