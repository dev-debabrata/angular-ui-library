import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SCROLL_TOP_VARIANTS, ScrollTopComponent } from './scroll-top.component';

/** Long filler content with a scroll container, so the button has something to do */
const scroller = (button: string, background = 'var(--ui-surface)') => `
  <div #box style="height: 420px; overflow-y: auto; border: 1px solid var(--ui-border);
                   border-radius: var(--ui-radius-lg); background: ${background}">
    <div style="padding: 24px 28px; color: var(--ui-text-muted); line-height: 1.7">
      <h3 style="margin-top: 0; color: var(--ui-text)">Scroll down ↓</h3>
      @for (p of paragraphs; track p) {
        <p>{{ p }}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.
          Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.</p>
      }
    </div>
    ${button}
  </div>
`;

const paragraphs = Array.from({ length: 20 }, (_, i) => i + 1);

const meta: Meta<ScrollTopComponent> = {
  title: 'Components/Misc/Scroll Top',
  component: ScrollTopComponent,
  tags: ['autodocs'],
  argTypes: {
    position: { control: 'inline-radio', options: ['right', 'left'] },
    variant: { control: 'select', options: SCROLL_TOP_VARIANTS },
  },
  args: { threshold: 200 },
  render: (args) => ({
    props: { ...args, paragraphs },
    template: scroller(
      `<np-scroll-top [target]="box" [threshold]="threshold" [position]="position ?? 'right'"
         [progress]="progress ?? true" [icon]="icon ?? 'chevron-up'" [variant]="variant ?? 'default'"
         [label]="label ?? ''" [percent]="percent ?? false" [smart]="smart ?? false" />`,
    ),
  }),
};

export default meta;
type Story = StoryObj<ScrollTopComponent>;

/** Scroll the box: the button appears after 200px, the ring shows how far you are, and a click scrolls back up */
export const Default: Story = {};

export const LeftSide: Story = { args: { position: 'left' } };

/** Plain button without the progress ring, and a different icon */
export const NoProgress: Story = { args: { progress: false, icon: 'arrow-up' } };

/** `label` turns the button into a pill with text */
export const WithLabel: Story = { args: { label: 'Top', icon: 'arrow-up' } };

/** `smart` shows the button only while scrolling up; `percent` shows how far you've read (hover brings the icon back) */
export const SmartPercent: Story = { args: { smart: true, percent: true } };

/** Every look, over a colorful background */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, paragraphs, variants: SCROLL_TOP_VARIANTS },
    template: scroller(
      `<div style="position: sticky; bottom: 0; display: flex; justify-content: center; gap: 28px">
        @for (v of variants; track v) {
          <np-scroll-top [target]="box" [threshold]="threshold" [variant]="v" [ariaLabel]="v" />
        }
      </div>`,
      'radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--ui-primary) 28%, transparent), transparent 55%), radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--ui-accent) 28%, transparent), transparent 55%), var(--ui-surface-muted)',
    ),
  }),
};
