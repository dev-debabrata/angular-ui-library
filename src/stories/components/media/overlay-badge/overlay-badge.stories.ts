import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SIZES, TONES } from '../../../utils/types';
import { AvatarComponent } from '../avatar/avatar.component';
import { IconComponent } from '../icon/icon.component';
import { OVERLAY_BADGE_VARIANTS, OverlayBadgeComponent } from './overlay-badge.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const POSITIONS = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
const bound = `[max]="max" [dot]="dot" [showZero]="showZero" [hidden]="hidden" [severity]="severity" [position]="position" [size]="size" [variant]="variant" [pulse]="pulse" [circular]="circular"`;
/** Badge on a 26px icon. `attrs` are extra bindings */
const badge = (value: string, icon: string, attrs = '[severity]="severity"') =>
  `<np-overlay-badge [value]="${value}" ${attrs}><np-icon name="${icon}" [size]="26" /></np-overlay-badge>`;
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
    variant: { control: 'select', options: OVERLAY_BADGE_VARIANTS },
  },
  args: {
    value: 6,
    max: 99,
    severity: 'danger',
    position: 'top-right',
    size: 'medium',
    variant: 'default',
  },
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
  <np-overlay-badge [dot]="true" severity="success" position="bottom-right"><np-avatar name="Jane Doe" size="large" /></np-overlay-badge>
  <np-overlay-badge [value]="3" [severity]="severity"><np-avatar name="Alex Lee" /></np-overlay-badge>
  <np-overlay-badge [value]="value" [severity]="severity">
    <button type="button" class="ui-btn"><np-icon name="shopping-cart" [size]="16" /> Cart</button>
  </np-overlay-badge>
`);

/** `pulse` adds an animated ping for live or new items */
export const Pulse: Story = row(
  badge('value', 'bell', '[severity]="severity" pulse') +
    '<np-overlay-badge dot pulse severity="success" circular position="bottom-right"><np-avatar name="Jane Doe" size="large" /></np-overlay-badge>',
);

/** An `icon` instead of the value (a verified check, a lock); `circular` sits it on a round avatar's edge */
export const WithIcon: Story = row(`
  <np-overlay-badge icon="check" severity="info" variant="gradient" circular position="bottom-right"><np-avatar name="Alex Lee" size="large" /></np-overlay-badge>
  <np-overlay-badge icon="lock" severity="warning" size="large"><np-icon name="folder" [size]="32" /></np-overlay-badge>
`);

/** Every look in each tone, on a colorful background so the glass look shows */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, tones: TONES, variants: OVERLAY_BADGE_VARIANTS },
    template: `<div style="display: grid; grid-template-columns: repeat(5, auto); justify-content: start; gap: 28px 40px; padding: 28px; border-radius: 16px; background: var(--ui-gradient); color: #fff">
      @for (v of variants; track v) { @for (tone of tones; track tone) { ${badge('value', 'bell', '[variant]="v" [severity]="tone"')} } }
    </div>`,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
