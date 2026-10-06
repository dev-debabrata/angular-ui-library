import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import type { MenuItem } from '../../../utils/types';
import { MEGA_MENU_VARIANTS, MegaMenuComponent, type MegaMenuItem } from './mega-menu.component';
import { appearanceStories } from '../../../utils/appearance-stories';

/** Build a column of sections, each a heading (with an optional icon) + links */
const column = (...sections: [string, string[], string?][]): MenuItem => ({
  items: sections.map(([label, l, icon]) => ({ label, icon, items: l.map((x) => ({ label: x })) })),
});

const items: MegaMenuItem[] = [
  {
    label: 'Furniture',
    icon: 'sofa',
    items: [
      column(['Living Room', ['Accessories', 'Armchair', 'Coffee Table', 'Couch', 'TV Stand']]),
      column(['Kitchen', ['Bar stool', 'Chair', 'Table']], ['Bathroom', ['Accessories']]),
      column(['Bedroom', ['Bed', 'Chaise lounge', 'Cupboard', 'Dresser', 'Wardrobe']]),
    ],
  },
  {
    label: 'Electronics',
    icon: 'laptop',
    items: [
      column(['Computer', ['Monitor', 'Mouse', 'Notebook', 'Keyboard', 'Printer']]),
      column(
        ['Home Theater', ['Projector', 'Speakers', 'TVs']],
        ['Gaming', ['Accessories', 'Console']],
      ),
      column(['Camera', ['Accessories', 'Tripod', 'Lens']], ['Audio', ['Headphones', 'Speakers']]),
    ],
  },
  {
    label: 'Sports',
    icon: 'trophy',
    items: [
      column(['Football', ['Kits', 'Shoes', 'Shorts', 'Training'], 'trophy']),
      column(
        ['Running', ['Accessories', 'Shoes'], 'zap'],
        ['Cycling', ['Bikes', 'Helmets'], 'bike'],
      ),
    ],
    featured: {
      title: 'Summer sale',
      text: 'Up to 40% off running gear this week.',
      image: 'https://picsum.photos/seed/nexprime/440/248',
      cta: 'Shop the sale',
    },
  },
  { label: 'Contact', icon: 'mail' },
];

const meta: Meta<MegaMenuComponent> = {
  title: 'Components/Menu/Mega Menu',
  component: MegaMenuComponent,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    variant: { control: 'select', options: MEGA_MENU_VARIANTS },
  },
  args: { model: items, orientation: 'horizontal', variant: 'default', itemClick: fn() },
  parameters: { docs: { story: { height: '380px' } } },
};

export default meta;
type Story = StoryObj<MegaMenuComponent>;

/** Open Sports for section heading icons and a `featured` promo card */
export const Horizontal: Story = {};

export const Vertical: Story = { args: { orientation: 'vertical' } };

/** Every variant (open one to compare the panels) */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: MEGA_MENU_VARIANTS },
    template: `
      <div style="display: grid; gap: 16px">
        @for (v of variants; track v) {
          <np-mega-menu [model]="model" [variant]="v" (itemClick)="itemClick($event)" />
        }
      </div>
    `,
  }),
  parameters: { docs: { story: { height: '560px' } } },
};

/** `stretch`: the panel spans the whole bar and the columns share its width */
export const Stretch: Story = { args: { stretch: true } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Horizontal example */
const appearance = appearanceStories(meta, Horizontal);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
