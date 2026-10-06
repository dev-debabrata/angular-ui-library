import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import type { MenuItem } from '../../../utils/types';
import { ButtonComponent } from '../../form/button/button.component';
import { PANEL_MENU_VARIANTS, PanelMenuComponent } from './panel-menu.component';
import { appearanceStories } from '../../../utils/appearance-stories';

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

const nav: MenuItem[] = [
  { label: 'Dashboard', icon: 'layout-dashboard' },
  { label: 'Projects', icon: 'folder-kanban', items: [{ label: 'Active', icon: 'folder' }] },
  { label: 'Messages', icon: 'message-square', badge: '3' },
  { label: 'Settings', icon: 'settings' },
];

const meta: Meta<PanelMenuComponent> = {
  title: 'Components/Menu/Panel Menu',
  component: PanelMenuComponent,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: PANEL_MENU_VARIANTS } },
  args: { model: items, itemClick: fn(), collapsedChange: fn(), selectedChange: fn() },
};

export default meta;
type Story = StoryObj<PanelMenuComponent>;

export const Default: Story = {};

export const Multiple: Story = { args: { multiple: true } };

/** A sidebar: `[(selected)]` highlights the clicked item, `[(collapsed)]` shrinks it to an icon rail with tooltips */
export const Sidebar: Story = {
  args: { model: nav, variant: 'minimal', collapsed: false, selected: nav[0] },
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  render: (args) => ({
    props: args,
    template: `<div style="display: grid; justify-items: start; gap: 12px">
      <np-button variant="text" [icon]="collapsed ? 'panel-left' : 'panel-left-close'" [label]="collapsed ? 'Expand' : 'Collapse'" (clicked)="collapsed = !collapsed" />
      <np-panel-menu [model]="model" [variant]="variant" [(collapsed)]="collapsed" [(selected)]="selected" (collapsedChange)="collapsedChange($event)" (selectedChange)="selectedChange($event)" (itemClick)="itemClick($event)" />
    </div>`,
  }),
};

/** Every look side by side */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: PANEL_MENU_VARIANTS },
    template: `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px">
      @for (v of variants; track v) {
        <div><code style="display: block; margin-bottom: 8px">{{ v }}</code><np-panel-menu [model]="model" [variant]="v" (itemClick)="itemClick($event)" /></div>
      }
    </div>`,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
