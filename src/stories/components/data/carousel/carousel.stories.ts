import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { CAROUSEL_INDICATORS, CAROUSEL_VARIANTS, CarouselComponent } from './carousel.component';
import { appearanceStories } from '../../../utils/appearance-stories';

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

/** Full-width image with a caption, used by the image examples */
const imageSlide = (height: number) => `
  <ng-template let-item let-i="index">
    <div style="position: relative; overflow: hidden; border-radius: var(--ui-radius-lg)">
      <img [src]="'https://picsum.photos/seed/aurora-' + item + '/1200/500'" [alt]="item"
           style="display: block; width: 100%; height: ${height}px; object-fit: cover" draggable="false" />
      <span style="position: absolute; left: 20px; top: 16px; padding: 6px 12px; border-radius: var(--ui-radius-full);
                   background: rgb(15 23 42 / 0.6); color: #fff; font-size: 14px; text-transform: capitalize">
        {{ i + 1 }}. {{ item }}
      </span>
    </div>
  </ng-template>
`;
const imageArgs = {
  items: ['mountains', 'ocean', 'forest', 'desert', 'city'],
  numVisible: 1,
  circular: true,
};

/** Story with the image template */
const images = (args: Story['args']): Story => ({
  args: { ...imageArgs, ...args },
  render: (args) => ({
    props: args,
    template: `<np-carousel ${argsToTemplate(args)}>${imageSlide(320)}</np-carousel>`,
  }),
});

/** One labeled carousel per value of the `key` input */
const each = (key: string, values: readonly string[], slide: string, args = {}): Story => ({
  args,
  render: (args) => ({
    props: { ...args, values },
    template: `
      <div style="display: grid; gap: 12px">
        @for (v of values; track v) {
          <b style="margin-top: 16px; text-transform: capitalize">{{ v }}</b>
          <np-carousel ${argsToTemplate(args)} [${key}]="v">${slide}</np-carousel>
        }
      </div>
    `,
  }),
});

const meta: Meta<CarouselComponent> = {
  title: 'Components/Data/Carousel',
  component: CarouselComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: CAROUSEL_VARIANTS },
    indicator: { control: 'select', options: CAROUSEL_INDICATORS },
  },
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
export const ImageSlider: Story = images({});

/** Dots only, no arrows */
export const IndicatorsOnly: Story = { args: { showNavigators: false, numVisible: 2 } };

/** Crossfading autoplay with story-style bars: the current one fills over the interval (restarts after hover) */
export const AutoplayBars: Story = images({
  variant: 'fade',
  indicator: 'bars',
  autoplayInterval: 3000,
});

/** Slides move up and down (arrow keys Up/Down, vertical swipe) within `height` */
export const Vertical: Story = images({ vertical: true, indicator: 'numbers' });

/** The indicator styles: dots, bars, numbers ("2 / 7") and progress */
export const Indicators: Story = each('indicator', CAROUSEL_INDICATORS, productCard);

/** Every variant with the same images */
export const Variants: Story = each('variant', CAROUSEL_VARIANTS, imageSlide(200), imageArgs);

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
