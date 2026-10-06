import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { AnimateOnScrollComponent, SCROLL_ANIMATIONS } from './animate-on-scroll.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const scroller =
  'height: 400px; overflow-y: auto; padding: 0 24px; border: 1px solid var(--ui-border); border-radius: var(--ui-radius-lg); background: var(--ui-surface-muted)';
const spacer = `<p style="height: 420px; margin: 0; display: grid; place-items: center; color: var(--ui-text-muted); font-size: 14px">Scroll down ↓</p>`;
const card =
  'margin-bottom: 24px; padding: 24px; border-radius: var(--ui-radius-lg); background: var(--ui-surface); box-shadow: var(--ui-shadow); font-weight: 600';

const meta: Meta<AnimateOnScrollComponent> = {
  title: 'Components/Misc/Animate On Scroll',
  component: AnimateOnScrollComponent,
  tags: ['autodocs'],
  argTypes: { animation: { control: 'select', options: SCROLL_ANIMATIONS } },
  args: {
    animation: 'fade-up',
    delay: 0,
    duration: 600,
    once: true,
    threshold: 0.15,
    stagger: 0,
    scrub: false,
    enter: fn(),
    leave: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div #scroller style="${scroller}">
        ${spacer}
        @for (n of [1, 2, 3, 4]; track n) {
          <np-animate-on-scroll [root]="scroller" [animation]="animation" [delay]="delay" [duration]="duration"
            [once]="once" [threshold]="threshold" [scrub]="scrub" (enter)="enter()" (leave)="leave()">
            <div style="${card}">Card {{ n }}: {{ animation }}</div>
          </np-animate-on-scroll>
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
          <np-animate-on-scroll [root]="scroller" [animation]="name" [duration]="duration" [once]="once" (enter)="enter()" (leave)="leave()">
            <div style="${card}">{{ name }}</div>
          </np-animate-on-scroll>
        }
      </div>
    `,
  }),
};

/** With once=false the animation replays every time a card scrolls back into view */
export const Replay: Story = { args: { once: false, animation: 'zoom-in' } };

/** `stagger` animates the direct children one after another (here 90 ms apart) instead of the whole block */
export const Stagger: Story = {
  args: { stagger: 90, animation: 'blur-up' },
  render: (args) => ({
    props: args,
    template: `
      <div #scroller style="${scroller}">
        ${spacer}
        <np-animate-on-scroll [root]="scroller" [animation]="animation" [stagger]="stagger" [duration]="duration"
          [once]="once" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px">
          @for (n of [1, 2, 3, 4, 5, 6]; track n) {
            <div style="${card}; margin: 0">Item {{ n }}</div>
          }
        </np-animate-on-scroll>
      </div>
    `,
  }),
};

/** `scrub` ties the reveal to the scroll position: scroll slowly, or back up, and the cards follow */
export const Scrub: Story = { args: { scrub: true, animation: 'tilt' } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
