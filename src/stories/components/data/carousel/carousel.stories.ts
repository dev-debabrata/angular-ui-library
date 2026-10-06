import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { CarouselComponent } from './carousel.component';

const products = [
  { name: 'Aurora Headphones', price: 199, tag: 'New', seed: 'headphones' },
  { name: 'Nimbus Watch', price: 249, tag: 'Popular', seed: 'watch' },
  { name: 'Lumen Lamp', price: 89, tag: 'Sale', seed: 'lamp' },
  { name: 'Drift Sneakers', price: 129, tag: 'New', seed: 'sneakers' },
  { name: 'Echo Speaker', price: 159, tag: 'Popular', seed: 'speaker' },
  { name: 'Orbit Backpack', price: 99, tag: 'Sale', seed: 'backpack' },
  { name: 'Pixel Camera', price: 549, tag: 'New', seed: 'camera' },
];

/** Product card used as the item template */
const productCard = `
  <ng-template let-item>
    <div style="overflow: hidden; border: 1px solid var(--ui-border); border-radius: var(--ui-radius-lg);
                background: var(--ui-surface); box-shadow: var(--ui-shadow-sm)">
      <img [src]="'https://picsum.photos/seed/' + item.seed + '/400/260'" [alt]="item.name"
           style="display: block; width: 100%; height: 150px; object-fit: cover" draggable="false" />
      <div style="display: flex; flex-direction: column; gap: 6px; padding: 12px 14px 14px">
        <span style="align-self: flex-start; padding: 1px 8px; border-radius: 999px; font-size: 11px;
                     background: var(--ui-primary-soft); color: var(--ui-primary)">{{ item.tag }}</span>
        <b style="font-size: 15px">{{ item.name }}</b>
        <span style="color: var(--ui-text-muted)">\${{ item.price }}</span>
      </div>
    </div>
  </ng-template>
`;

const meta: Meta<CarouselComponent> = {
  title: 'Components/Data/Carousel',
  component: CarouselComponent,
  tags: ['autodocs'],
  args: { items: products, numVisible: 3, numScroll: 1, pageChange: fn() },
  render: (args) => ({
    props: args,
    template: `<np-carousel ${argsToTemplate(args)}>${productCard}</np-carousel>`,
  }),
};

export default meta;
type Story = StoryObj<CarouselComponent>;

export const Default: Story = {};

/** Loops forever and advances every 3 seconds (pauses on hover or focus) */
export const Autoplay: Story = { args: { circular: true, autoplayInterval: 3000 } };

/** Moves a whole page of three at a time */
export const ScrollByPage: Story = { args: { numScroll: 3 } };

/** One full-width image per slide */
export const ImageSlider: Story = {
  args: {
    items: ['mountains', 'ocean', 'forest', 'desert', 'city'],
    numVisible: 1,
    circular: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <np-carousel ${argsToTemplate(args)}>
        <ng-template let-item let-i="index">
          <div style="position: relative; overflow: hidden; border-radius: var(--ui-radius-lg)">
            <img [src]="'https://picsum.photos/seed/aurora-' + item + '/1200/500'" [alt]="item"
                 style="display: block; width: 100%; height: 320px; object-fit: cover" draggable="false" />
            <span style="position: absolute; left: 20px; bottom: 16px; padding: 6px 12px; border-radius: 999px;
                         background: rgb(15 23 42 / 0.6); color: #fff; font-size: 14px; text-transform: capitalize">
              {{ i + 1 }}. {{ item }}
            </span>
          </div>
        </ng-template>
      </np-carousel>
    `,
  }),
};

/** Dots only, no arrows */
export const IndicatorsOnly: Story = { args: { showNavigators: false, numVisible: 2 } };
