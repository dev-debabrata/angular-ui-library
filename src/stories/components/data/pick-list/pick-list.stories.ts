import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { PickListComponent } from './pick-list.component';

interface Product {
  name: string;
  category: string;
  price: number;
}

const products: Product[] = [
  { name: 'Bamboo Watch', category: 'Accessories', price: 65 },
  { name: 'Black Watch', category: 'Accessories', price: 72 },
  { name: 'Blue Band', category: 'Fitness', price: 79 },
  { name: 'Blue T-Shirt', category: 'Clothing', price: 29 },
  { name: 'Bracelet', category: 'Accessories', price: 15 },
  { name: 'Brown Purse', category: 'Accessories', price: 120 },
  { name: 'Chakra Bracelet', category: 'Accessories', price: 32 },
  { name: 'Galaxy Earrings', category: 'Accessories', price: 34 },
  { name: 'Game Controller', category: 'Electronics', price: 99 },
  { name: 'Gaming Set', category: 'Electronics', price: 299 },
];

/** Binds every set arg; `source`/`target` use two-way binding so moves persist in the story */
const pickList = (args: Record<string, unknown>, content = '') => ({
  props: args,
  template: `<nex-pick-list [(source)]="source" [(target)]="target" ${argsToTemplate(args, {
    exclude: ['source', 'target', 'sourceChange', 'targetChange'],
  })}>${content}</nex-pick-list>`,
});

const meta: Meta<PickListComponent<Product>> = {
  title: 'Components/Data/Pick List',
  component: PickListComponent,
  tags: ['autodocs'],
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
