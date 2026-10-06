import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { PICK_LIST_VARIANTS, PickListComponent } from './pick-list.component';
import { appearanceStories } from '../../../utils/appearance-stories';

interface Product {
  name: string;
  category: string;
  price: number;
  icon: string;
}

const products: Product[] = [
  { name: 'Bamboo Watch', category: 'Accessories', price: 65, icon: 'watch' },
  { name: 'Black Watch', category: 'Accessories', price: 72, icon: 'watch' },
  { name: 'Blue Band', category: 'Fitness', price: 79, icon: 'dumbbell' },
  { name: 'Blue T-Shirt', category: 'Clothing', price: 29, icon: 'shirt' },
  { name: 'Bracelet', category: 'Accessories', price: 15, icon: 'gem' },
  { name: 'Brown Purse', category: 'Accessories', price: 120, icon: 'shopping-bag' },
  { name: 'Chakra Bracelet', category: 'Accessories', price: 32, icon: 'gem' },
  { name: 'Galaxy Earrings', category: 'Accessories', price: 34, icon: 'sparkles' },
  { name: 'Game Controller', category: 'Electronics', price: 99, icon: 'gamepad-2' },
  { name: 'Gaming Set', category: 'Electronics', price: 299, icon: 'joystick' },
];

/** Binds every set arg; `source`/`target` use two-way binding so moves persist in the story */
const pickList = (args: Record<string, unknown>, content = '') => ({
  props: args,
  template: `<np-pick-list [(source)]="source" [(target)]="target" ${argsToTemplate(args, {
    exclude: ['source', 'target', 'sourceChange', 'targetChange'],
  })}>${content}</np-pick-list>`,
});

const meta: Meta<PickListComponent<Product>> = {
  title: 'Components/Data/Pick List',
  component: PickListComponent,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: PICK_LIST_VARIANTS } },
  args: {
    source: products,
    target: [],
    optionLabel: 'name',
    sourceChange: fn(),
    targetChange: fn(),
    moveToTarget: fn(),
    moveToSource: fn(),
    reorder: fn(),
  },
  render: (args) =>
    pickList(
      args,
      `
      <ng-template let-item>
        <div style="display: flex; justify-content: space-between; gap: 12px">
          <div>
            <div style="font-weight: 600">{{ item.name }}</div>
            <div style="font-size: 12px; opacity: 0.7">{{ item.category }}</div>
          </div>
          <span style="font-weight: 600">\${{ item.price }}</span>
        </div>
      </ng-template>`,
    ),
};

export default meta;
type Story = StoryObj<PickListComponent<Product>>;

export const Default: Story = {};

/** Drag and drop is on by default. This story turns it off */
export const WithoutDragDrop: Story = { args: { dragdrop: false } };

export const WithFilter: Story = { args: { filter: true, filterPlaceholder: 'Search by name' } };

/** Without a projected template each item shows its `optionLabel` property */
export const PlainLabels: Story = { render: (args) => pickList(args) };

/** Built-in item layout: `optionIcon` and `optionDescription` name item properties (also searched by the filter) */
export const IconsAndDescriptions: Story = {
  args: { optionIcon: 'icon', optionDescription: 'category', filter: true },
  render: (args) => pickList(args),
};

/** `targetLimit` caps the target list: moves are cut off and the count turns amber when it's full */
export const TargetLimit: Story = { args: { targetLimit: 3, targetHeader: 'Top 3' } };

/** Every variant, with icons and descriptions */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: PICK_LIST_VARIANTS },
    template: `
      <div style="display: grid; gap: 32px">
        @for (v of variants; track v) {
          <div style="display: grid; gap: 8px; padding: 16px; border-radius: 16px"
            [style.background]="v === 'glass' ? 'var(--ui-gradient)' : ''">
            <code style="justify-self: start; color: var(--ui-text-muted); font-size: 12px">{{ v }}</code>
            <np-pick-list [variant]="v" [source]="source.slice(0, 5)" [target]="source.slice(5, 7)"
              optionLabel="name" optionIcon="icon" optionDescription="category" />
          </div>
        }
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
