import type { Meta, StoryObj } from '@storybook/angular-vite';
import { componentWrapperDecorator } from '@storybook/angular-vite';

import { MenuItemComponent } from './menu-item.component';

/** Internal row used by all menus. Shown here for reference */
const meta: Meta<MenuItemComponent> = {
  title: 'Components/Menu Item',
  component: MenuItemComponent,
  // Internal building block of the menus: kept out of the sidebar
  tags: ['!dev', '!autodocs'],
  decorators: [componentWrapperDecorator((story) => `<div style="width: 240px">${story}</div>`)],
  args: { item: { label: 'Inbox', icon: 'mail', badge: '12' } },
};

export default meta;
type Story = StoryObj<MenuItemComponent>;

export const Default: Story = {};

export const Submenu: Story = {
  args: {
    item: { label: 'Share', icon: 'share-2', items: [] },
    chevron: 'chevron-right',
    open: true,
  },
};

export const Disabled: Story = {
  args: { item: { label: 'Print', icon: 'printer', disabled: true } },
};
