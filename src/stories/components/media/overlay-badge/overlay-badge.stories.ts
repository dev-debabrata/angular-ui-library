import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SIZES, TONES } from '../../../utils/types';
import { AvatarComponent } from '../avatar/avatar.component';
import { IconComponent } from '../icon/icon.component';
import { OverlayBadgeComponent } from './overlay-badge.component';

const POSITIONS = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
const bound = `[max]="max" [dot]="dot" [showZero]="showZero" [hidden]="hidden" [severity]="severity" [position]="position" [size]="size"`;
/** Badge on a 26px icon. `attrs` are extra bindings */
const badge = (value: string, icon: string, attrs = '[severity]="severity"') =>
  `<nex-overlay-badge [value]="${value}" ${attrs}><nex-icon name="${icon}" [size]="26" /></nex-overlay-badge>`;
/** Story that renders `content` in a flex row */
const row = (content: string): Story => ({
  render: (args) => ({
    props: { ...args, tones: TONES, positions: POSITIONS, sizes: SIZES },
    template: `<div style="display: flex; align-items: center; gap: 40px; padding: 16px">${content}</div>`,
  }),
});

const meta: Meta<OverlayBadgeComponent> = {
  title: 'Components/Media/Overlay Badge',
  component: OverlayBadgeComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [IconComponent, AvatarComponent] })],
  argTypes: {
    severity: { control: 'select', options: TONES },
    position: { control: 'select', options: POSITIONS },
    size: { control: 'select', options: SIZES },
  },
  args: { value: 6, max: 99, severity: 'danger', position: 'top-right', size: 'medium' },
  ...row(
    badge('1', 'phone', bound) +
      badge('value', 'message-square', bound) +
      badge('18', 'mail', bound),
  ),
};

export default meta;
type Story = StoryObj<OverlayBadgeComponent>;

/** Counts on icons, like Angular Material's matBadge */
export const Default: Story = {};

export const Dot: Story = { args: { dot: true } };

/** Values above `max` show as "99+" */
export const MaxValue: Story = row(
  badge('120', 'bell', bound) + badge('1500', 'inbox', '[max]="999" severity="info"'),
);

export const Severities: Story = row(
  `@for (tone of tones; track tone) { ${badge('value', 'bell', '[severity]="tone"')} }`,
);

export const Positions: Story = row(
  `@for (p of positions; track p) { ${badge('value', 'mail', '[position]="p" [severity]="severity"')} }`,
);

export const Sizes: Story = row(
  `@for (s of sizes; track s) { ${badge('value', 'shopping-cart', '[size]="s" [severity]="severity"')} }`,
);

/** Works on any content: avatars, buttons */
export const OnAvatarAndButton: Story = row(`
  <nex-overlay-badge [dot]="true" severity="success" position="bottom-right"><nex-avatar name="Jane Doe" size="large" /></nex-overlay-badge>
  <nex-overlay-badge [value]="3" [severity]="severity"><nex-avatar name="Alex Lee" /></nex-overlay-badge>
  <nex-overlay-badge [value]="value" [severity]="severity">
    <button type="button" class="ui-btn"><nex-icon name="shopping-cart" [size]="16" /> Cart</button>
  </nex-overlay-badge>
`);
