import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import type { MenuItem } from '../../../utils/types';
import { ButtonComponent } from '../../form/button/button.component';
import { TieredMenuComponent } from './tiered-menu.component';

const items: MenuItem[] = [
  {
    label: 'File',
    icon: 'file',
    items: [
      {
        label: 'New',
        icon: 'plus',
        items: [
          { label: 'Document', icon: 'file' },
          { label: 'Folder', icon: 'folder' },
        ],
      },
      { label: 'Open', icon: 'folder' },
      { label: 'Save', icon: 'save' },
      { separator: true },
      { label: 'Print', icon: 'printer', disabled: true },
    ],
  },
  {
    label: 'Edit',
    icon: 'square-pen',
    items: [
      { label: 'Copy', icon: 'copy' },
      { label: 'Delete', icon: 'trash-2' },
    ],
  },
  {
    label: 'Share',
    icon: 'share-2',
    items: [
      { label: 'Email', icon: 'mail' },
      { label: 'Download', icon: 'download' },
      { label: 'Upload', icon: 'upload', badge: 'New' },
    ],
  },
  { separator: true },
  { label: 'Quit', icon: 'log-out' },
];

const meta: Meta<TieredMenuComponent> = {
  title: 'Components/Menu/Tiered Menu',
  component: TieredMenuComponent,
  tags: ['autodocs'],
  args: { model: items, popup: false, itemClick: fn() },
  parameters: { docs: { story: { height: '320px' } } },
};

export default meta;
type Story = StoryObj<TieredMenuComponent>;

export const Default: Story = {};

export const Popup: Story = {
  args: { popup: true },
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: { docs: { story: { inline: false, height: '360px' } } },
  render: (args) => ({
    props: args,
    template: `
      <np-button label="Show menu" [primary]="true" (clicked)="menu.toggle($event)" />
      <np-tiered-menu #menu [model]="model" [popup]="true" (itemClick)="itemClick($event)" />
    `,
  }),
};
