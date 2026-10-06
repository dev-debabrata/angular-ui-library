import type { Meta, StoryObj } from '@storybook/angular-vite';
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import type { MenuItem } from '../../../utils/types';
import { SearchInputComponent } from '../../form/search-input/search-input.component';
import { MENUBAR_VARIANTS, MenubarComponent } from './menubar.component';
import { appearanceStories } from '../../../utils/appearance-stories';

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
  title: 'Components/Menu/Menubar',
  component: MenubarComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SearchInputComponent] })],
  argTypes: { variant: { control: 'select', options: MENUBAR_VARIANTS } },
  args: { model: items, variant: 'default', sticky: false, itemClick: fn(), currentChange: fn() },
  parameters: { docs: { story: { height: '320px' } } },
  render: (args) => ({
    props: args,
    template: `
      <np-menubar [model]="model" [variant]="variant" [sticky]="sticky" [current]="current"
        (itemClick)="itemClick($event)" (currentChange)="currentChange($event)">
        <strong menubarStart style="font-size: 16px; background: var(--ui-gradient); -webkit-background-clip: text; color: transparent">Aurora</strong>
        <np-search-input menubarEnd placeholder="Search" />
      </np-menubar>
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

/** Every variant, with Home as the `current` item (click a link to move it) */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: MENUBAR_VARIANTS, home: items[0] },
    template: `
      <div style="display: grid; gap: 20px; padding: 24px; border-radius: 20px; background:
        radial-gradient(circle at 10% 20%, color-mix(in srgb, var(--ui-primary) 28%, transparent), transparent 45%),
        radial-gradient(circle at 90% 70%, color-mix(in srgb, var(--ui-accent) 28%, transparent), transparent 45%),
        var(--ui-surface-muted)">
        @for (v of variants; track v) {
          <np-menubar [model]="model" [variant]="v" [current]="home" (itemClick)="itemClick($event)" (currentChange)="currentChange($event)">
            <strong menubarStart style="font-size: 16px">{{ v }}</strong>
          </np-menubar>
        }
      </div>
    `,
  }),
  // Room below the last bar for its dropdown
  parameters: { docs: { story: { height: '600px' } } },
};

/** `sticky` keeps the (glass) bar at the top while the content scrolls under it */
export const Sticky: Story = {
  args: { variant: 'glass', sticky: true },
  decorators: [
    componentWrapperDecorator(
      (story) =>
        `<div style="height: 300px; overflow: auto">${story}<div style="height: 900px; margin-top: 16px; border-radius: 16px; background: var(--ui-gradient); opacity: 0.3"></div></div>`,
    ),
  ],
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
