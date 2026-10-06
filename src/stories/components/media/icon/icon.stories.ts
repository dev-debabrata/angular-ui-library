import type { Meta, StoryObj } from '@storybook/angular-vite';

import { ICON_VARIANTS, IconComponent } from './icon.component';

/** Browse and copy every icon on the "Icons" page at the top of the sidebar */
const meta: Meta<IconComponent> = {
  title: 'Components/Media/Icon',
  component: IconComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'range', min: 12, max: 64, step: 2 } },
    strokeWidth: { control: { type: 'range', min: 0.5, max: 3, step: 0.25 } },
    variant: { control: 'inline-radio', options: ICON_VARIANTS },
  },
  args: { name: 'heart', size: 32 },
};

export default meta;
type Story = StoryObj<IconComponent>;

export const Default: Story = {};

export const ThinStroke: Story = { args: { name: 'house', strokeWidth: 1 } };

/** Icons that use currentColor take the color of the surrounding text */
export const Colored: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 16px">
        <np-icon [name]="name" [size]="size" style="color: var(--ui-primary)" />
        <np-icon [name]="name" [size]="size" style="color: var(--ui-success)" />
        <np-icon [name]="name" [size]="size" style="color: var(--ui-warning)" />
        <np-icon [name]="name" [size]="size" style="color: var(--ui-danger)" />
      </div>
    `,
  }),
};

/** Every icon supports these styles; the soft and solid tiles fill the whole `size` */
export const Variants: Story = {
  args: { name: 'rocket', size: 40 },
  render: (args) => ({
    props: { ...args, variants: ICON_VARIANTS },
    template: `
      <div style="display: flex; gap: 24px; align-items: center">
        @for (v of variants; track v) {
          <np-icon [name]="name" [size]="size" [variant]="v" [label]="v" />
        }
      </div>
    `,
  }),
};
