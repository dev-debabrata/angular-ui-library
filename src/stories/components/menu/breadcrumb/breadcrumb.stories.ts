import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { BREADCRUMB_VARIANTS, BreadcrumbComponent } from './breadcrumb.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<BreadcrumbComponent> = {
  title: 'Components/Menu/Breadcrumb',
  component: BreadcrumbComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: BREADCRUMB_VARIANTS },
    separator: { control: 'select', options: ['/', '›', 'chevron', 'arrow', 'slash', 'dot'] },
  },
  args: {
    items: [
      { label: 'Home' },
      { label: 'Products', icon: 'shopping-bag' },
      { label: 'Laptops', icon: 'laptop' },
      { label: 'MacBook Pro' },
    ],
    itemClick: fn(),
  },
};

export default meta;
type Story = StoryObj<BreadcrumbComponent>;

export const Default: Story = {};

/** `separator` takes any text, or 'chevron', 'arrow', 'slash' or 'dot' for an icon */
export const CustomSeparator: Story = { args: { separator: 'chevron' } };

/** Every variant, with item `icon`s and `home` (the first item as a house icon) */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: BREADCRUMB_VARIANTS },
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        @for (v of variants; track v) {
          <np-breadcrumb [variant]="v" [items]="items" separator="chevron" home (itemClick)="itemClick($event)" />
        }
      </div>
    `,
  }),
};

/** `maxItems` collapses a long trail; the ellipsis button expands it */
export const Collapsed: Story = {
  args: {
    maxItems: 3,
    items: 'Home Docs Components Menu Forms Inputs'.split(' ').map((label) => ({ label })),
  },
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
