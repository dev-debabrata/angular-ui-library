import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import type { MenuItem } from '../../../utils/types';
import { ButtonComponent } from '../../form/button/button.component';
import { AvatarComponent } from '../../media/avatar/avatar.component';
import { MENU_VARIANTS, MenuComponent } from './menu.component';
import { appearanceStories } from '../../../utils/appearance-stories';

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
  title: 'Components/Menu/Menu',
  component: MenuComponent,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: MENU_VARIANTS } },
  args: { model: grouped, popup: false, variant: 'default', itemClick: fn() },
};

export default meta;
type Story = StoryObj<MenuComponent>;

export const Default: Story = {};

export const Popup: Story = {
  args: { popup: true },
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: { docs: { story: { height: '320px' } } },
  render: (args) => ({
    props: args,
    template: `
      <np-button label="Show menu" [primary]="true" (clicked)="menu.toggle($event)" />
      <np-menu #menu [model]="model" [popup]="true" [variant]="variant" (itemClick)="itemClick($event)" />
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

/** An account menu: `[menuHeader]` / `[menuFooter]` content, and `shortcuts` showing badges as keys */
export const AccountMenu: Story = {
  args: {
    shortcuts: true,
    model: [
      { label: 'Profile', icon: 'user', badge: '⇧⌘P' },
      { label: 'Settings', icon: 'settings', badge: '⌘,' },
      { separator: true },
      { label: 'Log out', icon: 'log-out', badge: '⇧⌘Q' },
    ],
  },
  decorators: [moduleMetadata({ imports: [AvatarComponent] })],
  render: (args) => ({
    props: args,
    template: `<np-menu [model]="model" [variant]="variant" [shortcuts]="shortcuts" (itemClick)="itemClick($event)">
      <div menuHeader style="display: flex; align-items: center; gap: 10px"><np-avatar name="Amy Elsner" src="https://i.pravatar.cc/64?img=5" status="online" />
        <div><strong>Amy Elsner</strong><br /><small>amy&#64;nexprime.dev</small></div></div>
      <small menuFooter style="color: var(--ui-text-subtle)">NexPrime v2 · Terms · Privacy</small>
    </np-menu>`,
  }),
};

/** Every look, labeled through the `[menuHeader]` slot, on a tinted background so glass shows */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: MENU_VARIANTS },
    template: `<div style="display: flex; flex-wrap: wrap; gap: 20px; padding: 24px; background: linear-gradient(135deg, var(--ui-primary-soft), transparent)">
      @for (v of variants; track v) {
        <np-menu [model]="model" [variant]="v" (itemClick)="itemClick($event)"><code menuHeader>{{ v }}</code></np-menu>
      }
    </div>`,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
