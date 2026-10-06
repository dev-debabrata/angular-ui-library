import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { HEADER_VARIANTS, HeaderComponent } from './header.component';
import type { MenuItem } from '../../../utils/types';
import { appearanceStories } from '../../../utils/appearance-stories';

const links: MenuItem[] = [
  { label: 'Home', icon: 'house' },
  { label: 'Products', icon: 'layout-grid' },
  { label: 'Docs', icon: 'book-open' },
  { label: 'Pricing', icon: 'tag' },
];

const colorful =
  'background: radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--ui-primary) 28%, transparent), transparent 55%), radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--ui-accent) 28%, transparent), transparent 55%), var(--ui-surface-muted)';

const meta: Meta<HeaderComponent> = {
  title: 'Components/Misc/Header',
  component: HeaderComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: { variant: { control: 'select', options: HEADER_VARIANTS } },
  args: { login: fn(), logout: fn(), createAccount: fn(), activeChange: fn() },
};

export default meta;
type Story = StoryObj<HeaderComponent>;

export const LoggedIn: Story = { args: { user: { name: 'Jane Doe' } } };

export const LoggedOut: Story = {};

/** `sticky` pins the header while the area scrolls (slimmer, with a shadow once scrolled); `links` adds a centered
 * nav with the `[(active)]` link highlighted, in a menu on phones; `avatar` replaces the welcome text */
export const StickyWithNavigation: Story = {
  args: { variant: 'glass', links, active: 'Docs', user: { name: 'Jane Doe' }, avatar: true },
  render: (args) => ({
    props: args,
    template: `
      <div style="height: 420px; overflow-y: auto; ${colorful}">
        <np-header sticky [variant]="variant" [links]="links" [(active)]="active" [user]="user"
          [avatar]="avatar" (activeChange)="activeChange($event)" (logout)="logout($event)" />
        @for (n of [1, 2, 3, 4, 5, 6]; track n) {
          <p style="margin: 24px; padding: 32px; background: var(--ui-surface)">Section {{ n }}</p>
        }
      </div>
    `,
  }),
};

/** Every look, logged out, over a colorful background */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, links, variants: HEADER_VARIANTS },
    template: `
      <div style="display: grid; gap: 20px; padding: 20px 0; ${colorful}">
        @for (v of variants; track v) {
          <np-header [variant]="v" [brand]="v" [links]="links" active="Home" (login)="login($event)" />
        }
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the LoggedIn example */
const appearance = appearanceStories(meta, LoggedIn);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
