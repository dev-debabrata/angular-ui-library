import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import type { MenuItem } from '../../../utils/types';
import { MegaMenuComponent } from './mega-menu.component';

/** Build a column of sections, each a heading + links */
const column = (...sections: [string, string[]][]): MenuItem => ({
  items: sections.map(([label, links]) => ({ label, items: links.map((l) => ({ label: l })) })),
});

const items: MenuItem[] = [
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
      column(['Football', ['Kits', 'Shoes', 'Shorts', 'Training']]),
      column(['Running', ['Accessories', 'Shoes', 'T-Shirts']], ['Cycling', ['Bikes', 'Helmets']]),
    ],
  },
  { label: 'Contact', icon: 'mail' },
];

const meta: Meta<MegaMenuComponent> = {
  title: 'Components/Menu/Mega Menu',
  component: MegaMenuComponent,
  tags: ['autodocs'],
  argTypes: { orientation: { control: 'select', options: ['horizontal', 'vertical'] } },
  args: { model: items, orientation: 'horizontal', itemClick: fn() },
  parameters: { docs: { story: { height: '380px' } } },
};

export default meta;
type Story = StoryObj<MegaMenuComponent>;

export const Horizontal: Story = {};

export const Vertical: Story = { args: { orientation: 'vertical' } };
