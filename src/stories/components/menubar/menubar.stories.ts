import type { Meta, StoryObj } from '@storybook/angular-vite';
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import type { MenuItem } from '../../types';
import { SearchInputComponent } from '../search-input/search-input.component';
import { MenubarComponent } from './menubar.component';

const items: MenuItem[] = [
  { label: 'Home', icon: 'house' },
  {
    label: 'Features',
    icon: 'star',
    items: [
      { label: 'Core', icon: 'settings' },
      { label: 'Blocks', icon: 'folder' },
      { label: 'UI Kit', icon: 'pencil', badge: 'New' },
    ],
  },
  {
    label: 'Projects',
    icon: 'folder',
    items: [
      { label: 'Components', icon: 'file' },
      {
        label: 'Templates',
        icon: 'copy',
        items: [
          { label: 'Apollo', icon: 'file' },
          {
            label: 'Ultima',
            icon: 'file',
            items: [
              { label: 'Light', icon: 'file' },
              { label: 'Dark', icon: 'file' },
            ],
          },
        ],
      },
      { separator: true },
      { label: 'Archived', icon: 'trash-2', disabled: true },
    ],
  },
  { label: 'Contact', icon: 'mail' },
];

const meta: Meta<MenubarComponent> = {
  title: 'Components/Menubar',
  component: MenubarComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SearchInputComponent] })],
  args: { model: items, itemClick: fn() },
  parameters: { docs: { story: { height: '320px' } } },
  render: (args) => ({
    props: args,
    template: `
      <nex-menubar [model]="model" (itemClick)="itemClick($event)">
        <strong menubarStart style="font-size: 16px; background: var(--ui-gradient); -webkit-background-clip: text; color: transparent">Aurora</strong>
        <nex-search-input menubarEnd placeholder="Search" />
      </nex-menubar>
    `,
  }),
};

export default meta;
type Story = StoryObj<MenubarComponent>;

export const Default: Story = {};

export const Narrow: Story = {
  decorators: [
    componentWrapperDecorator((story) => `<div style="max-width: 420px">${story}</div>`),
  ],
};
