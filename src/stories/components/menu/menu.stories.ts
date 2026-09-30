import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import type { MenuItem } from '../../types';
import { ButtonComponent } from '../button/button.component';
import { MenuComponent } from './menu.component';

const grouped: MenuItem[] = [
  {
    label: 'Documents',
    items: [
      { label: 'New', icon: 'plus' },
      { label: 'Search', icon: 'search' },
    ],
  },
  {
    label: 'Profile',
    items: [
      { label: 'Settings', icon: 'settings' },
      { label: 'Logout', icon: 'log-out' },
    ],
  },
];

const meta: Meta<MenuComponent> = {
  title: 'Components/Menu',
  component: MenuComponent,
  tags: ['autodocs'],
  args: { model: grouped, popup: false, itemClick: fn() },
};

export default meta;
type Story = StoryObj<MenuComponent>;

export const Default: Story = {};

export const Popup: Story = {
  args: { popup: true },
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: { docs: { story: { inline: false, height: '320px' } } },
  render: (args) => ({
    props: args,
    template: `
      <storybook-button label="Show menu" [primary]="true" (onClick)="menu.toggle($event)" />
      <nex-menu #menu [model]="model" [popup]="true" (itemClick)="itemClick($event)" />
    `,
  }),
};

export const WithIconsAndBadges: Story = {
  args: {
    model: [
      { label: 'Inbox', icon: 'mail', badge: '12' },
      { label: 'Notifications', icon: 'bell', badge: '3' },
      { label: 'Starred', icon: 'star' },
      { separator: true },
      { label: 'Share', icon: 'share-2' },
      { label: 'Print', icon: 'printer', disabled: true },
      { label: 'Docs', icon: 'file', url: 'https://angular.dev' },
    ],
  },
};
