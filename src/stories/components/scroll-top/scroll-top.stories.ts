import type { Meta, StoryObj } from '@storybook/angular-vite';

import { ScrollTopComponent } from './scroll-top.component';

/** Long filler content with a scroll container, so the button has something to do */
const scroller = (button: string) => `
  <div #box style="height: 420px; overflow-y: auto; border: 1px solid var(--ui-border);
                   border-radius: var(--ui-radius-lg); background: var(--ui-surface)">
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

const meta: Meta<ScrollTopComponent> = {
  title: 'Components/Scroll Top',
  component: ScrollTopComponent,
  tags: ['autodocs'],
  argTypes: { position: { control: 'inline-radio', options: ['right', 'left'] } },
  args: { threshold: 200 },
  render: (args) => ({
    props: { ...args, paragraphs: Array.from({ length: 20 }, (_, i) => i + 1) },
    template: scroller(
      `<nex-scroll-top [target]="box" [threshold]="threshold" [position]="position ?? 'right'"
         [progress]="progress ?? true" [icon]="icon ?? 'chevron-up'" />`,
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
