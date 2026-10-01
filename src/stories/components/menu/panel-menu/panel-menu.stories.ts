import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import type { MenuItem } from '../../../utils/types';
import { PanelMenuComponent } from './panel-menu.component';

const items: MenuItem[] = [
  {
    label: 'Files',
    icon: 'file',
    items: [
      {
        label: 'Documents',
        icon: 'folder',
        items: [
          { label: 'Invoices', icon: 'file-text', badge: '4' },
          { label: 'Clients', icon: 'user' },
        ],
      },
      { label: 'Images', icon: 'image', items: [{ label: 'Logos', icon: 'image' }] },
      { separator: true },
      { label: 'Archive', icon: 'archive', disabled: true },
    ],
  },
  {
    label: 'Cloud',
    icon: 'cloud',
    items: [
      { label: 'Upload', icon: 'upload' },
      { label: 'Download', icon: 'download' },
      { label: 'Sync', icon: 'refresh-cw' },
    ],
  },
  {
    label: 'Devices',
    icon: 'monitor',
    items: [
      { label: 'Phone', icon: 'smartphone' },
      { label: 'Desktop', icon: 'monitor' },
      { label: 'Tablet', icon: 'tablet' },
    ],
  },
];

const meta: Meta<PanelMenuComponent> = {
  title: 'Components/Menu/Panel Menu',
  component: PanelMenuComponent,
  tags: ['autodocs'],
  args: { model: items, multiple: false, itemClick: fn() },
};

export default meta;
type Story = StoryObj<PanelMenuComponent>;

export const Default: Story = {};

export const Multiple: Story = { args: { multiple: true } };
