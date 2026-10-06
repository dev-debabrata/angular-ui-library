import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SKELETON_PRESETS, SKELETON_VARIANTS, SkeletonComponent } from './skeleton.component';
import { appearanceStories } from '../../../utils/appearance-stories';

/** <np-skeleton> with the given attributes, following the story's animation arg */
const sk = (attrs: string) => `<np-skeleton ${attrs} [animation]="animation" />`;

const meta: Meta<SkeletonComponent> = {
  title: 'Components/Feedback/Skeleton',
  component: SkeletonComponent,
  tags: ['autodocs'],
  argTypes: {
    shape: { control: 'select', options: ['rectangle', 'circle'] },
    animation: { control: 'select', options: ['wave', 'pulse', 'none'] },
    variant: { control: 'select', options: SKELETON_VARIANTS },
    preset: { control: 'select', options: ['', ...SKELETON_PRESETS] },
  },
  args: { shape: 'rectangle', width: '100%', height: '1rem', animation: 'wave' },
};

export default meta;
type Story = StoryObj<SkeletonComponent>;

export const Default: Story = {};

export const Shapes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; align-items: center; gap: 16px">
        ${sk('shape="circle" size="48px"')}
        ${sk('size="48px"')}
        ${sk('width="160px" height="48px" borderRadius="var(--ui-radius-lg)"')}
        ${sk('width="120px" height="12px" borderRadius="999px"')}
      </div>
    `,
  }),
};

export const Pulse: Story = { args: { animation: 'pulse', height: '2rem' } };

/** `duration` sets the speed of one wave or pulse cycle */
export const Duration: Story = { args: { preset: 'text', duration: '3s' } };

/** `preset` lays out a whole loading state: text (`lines`), avatar, list, card or table (`columns`) */
export const Presets: Story = {
  render: (args) => ({
    props: { ...args, presets: SKELETON_PRESETS },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 32px">
        @for (preset of presets; track preset) {
          <div style="display: grid; align-content: start; gap: 10px">
            <code style="color: var(--ui-text-muted); font-size: 12px">{{ preset }}</code>
            <np-skeleton [preset]="preset" [animation]="animation" />
          </div>
        }
      </div>
    `,
  }),
};

/** Every `variant` on a colorful background (glass is frosted): default, soft, gradient and glass */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: SKELETON_VARIANTS },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; padding: 24px; border-radius: var(--ui-radius-lg); background: radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--ui-primary) 28%, transparent), transparent 55%), radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--ui-accent) 28%, transparent), transparent 55%), var(--ui-surface-muted)">
        @for (v of variants; track v) {
          <div style="display: grid; gap: 10px">
            <code style="color: var(--ui-text-muted); font-size: 12px">{{ v }}</code>
            <np-skeleton preset="avatar" [variant]="v" [animation]="animation" />
          </div>
        }
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
