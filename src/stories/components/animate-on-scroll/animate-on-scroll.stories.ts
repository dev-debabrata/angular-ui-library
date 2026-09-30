import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { AnimateOnScrollComponent, SCROLL_ANIMATIONS } from './animate-on-scroll.component';

const scroller =
  'height: 400px; overflow-y: auto; padding: 0 24px; border: 1px solid var(--ui-border); border-radius: var(--ui-radius-lg); background: var(--ui-surface-muted)';
const spacer = `<p style="height: 420px; margin: 0; display: grid; place-items: center; color: var(--ui-text-muted); font-size: 14px">Scroll down ↓</p>`;
const card =
  'margin-bottom: 24px; padding: 24px; border-radius: var(--ui-radius-lg); background: var(--ui-surface); box-shadow: var(--ui-shadow); font-weight: 600';

const meta: Meta<AnimateOnScrollComponent> = {
  title: 'Components/Animate On Scroll',
  component: AnimateOnScrollComponent,
  tags: ['autodocs'],
  argTypes: { animation: { control: 'select', options: SCROLL_ANIMATIONS } },
  args: {
    animation: 'fade-up',
    delay: 0,
    duration: 600,
    once: true,
    threshold: 0.15,
    enter: fn(),
    leave: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div #scroller style="${scroller}">
        ${spacer}
        @for (n of [1, 2, 3, 4]; track n) {
          <nex-animate-on-scroll [root]="scroller" [animation]="animation" [delay]="delay" [duration]="duration"
            [once]="once" [threshold]="threshold" (enter)="enter()" (leave)="leave()">
            <div style="${card}">Card {{ n }}: {{ animation }}</div>
          </nex-animate-on-scroll>
        }
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<AnimateOnScrollComponent>;

export const Default: Story = {};

export const AllAnimations: Story = {
  render: (args) => ({
    props: { ...args, animations: SCROLL_ANIMATIONS },
    template: `
      <div #scroller style="${scroller}; overflow-x: hidden">
        ${spacer}
        @for (name of animations; track name) {
          <nex-animate-on-scroll [root]="scroller" [animation]="name" [duration]="duration" [once]="once" (enter)="enter()" (leave)="leave()">
            <div style="${card}">{{ name }}</div>
          </nex-animate-on-scroll>
        }
      </div>
    `,
  }),
};

/** With once=false the animation replays every time a card scrolls back into view */
export const Replay: Story = { args: { once: false, animation: 'zoom-in' } };
