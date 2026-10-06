import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import type { MenuItem } from '../../../utils/types';
import { ButtonComponent } from '../../form/button/button.component';
import { MENU_VARIANTS } from '../menu/menu.component';
import { TIERED_MENU_TRIGGERS, TieredMenuComponent } from './tiered-menu.component';
import { appearanceStories } from '../../../utils/appearance-stories';

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
  argTypes: {
    variant: { control: 'select', options: MENU_VARIANTS },
    trigger: { control: 'inline-radio', options: TIERED_MENU_TRIGGERS },
  },
  args: { model: items, popup: false, variant: 'default', itemClick: fn() },
  parameters: { docs: { story: { height: '320px' } } },
};

export default meta;
type Story = StoryObj<TieredMenuComponent>;

export const Default: Story = {};

export const Popup: Story = {
  args: { popup: true },
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: { docs: { story: { height: '360px' } } },
  render: (args) => ({
    props: args,
    template: `
      <np-button label="Show menu" [primary]="true" (clicked)="menu.toggle($event)" />
      <np-tiered-menu #menu [model]="model" [popup]="true" [variant]="variant" (itemClick)="itemClick($event)" />
    `,
  }),
};

/** `trigger="click"` opens submenus on click only, `shortcuts` shows badges as keys; arrow keys navigate */
export const KeyboardAndClick: Story = {
  args: {
    trigger: 'click',
    shortcuts: true,
    model: [
      {
        label: 'Edit',
        icon: 'square-pen',
        items: [
          { label: 'Undo', icon: 'undo-2', badge: '⌘Z' },
          { label: 'Copy', icon: 'copy', badge: '⌘C' },
        ],
      },
      { label: 'Search', icon: 'search', badge: '⌘K' },
    ],
  },
};

/** Every look side by side (hover an item to see its flyout) */
export const Variants: Story = {
  parameters: { docs: { story: { height: '640px' } } },
  render: (args) => ({
    props: { ...args, variants: MENU_VARIANTS },
    template: `<div style="display: grid; grid-template-columns: repeat(auto-fill, 460px); gap: 24px 0; padding: 24px; background: linear-gradient(135deg, var(--ui-primary-soft), transparent)">
      @for (v of variants; track v) {
        <div><code style="display: block; margin-bottom: 8px">{{ v }}</code><np-tiered-menu [model]="model" [variant]="v" (itemClick)="itemClick($event)" /></div>
      }
    </div>`,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
