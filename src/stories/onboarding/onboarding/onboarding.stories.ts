import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { IconComponent } from '../../components/media/icon/icon.component';
import {
  ONBOARDING_MODES,
  ONBOARDING_THEMES,
  OnboardingComponent,
  type OnboardingStep,
} from './onboarding.component';

const steps: OnboardingStep[] = [
  {
    target: '#ob-title',
    title: 'Welcome 👋',
    text: 'This short tour shows what each part of the page does.',
  },
  { target: '#ob-basic', text: 'Use this button to do basic stuff.' },
  { target: '#ob-link', text: 'Use this button to link to stuff.' },
  {
    target: '#ob-delete',
    text: 'Use this button to delete stuff. It asks before deleting anything.',
  },
  {
    target: '#ob-icons',
    title: 'Quick actions',
    text: 'Icon buttons do the same things in less space.',
  },
  {
    target: '#ob-banner',
    text: 'The tour works on any element, including text on a colored background.',
  },
  {
    target: '#ob-restart',
    title: 'All done!',
    text: 'Come back to this tour any time with this button.',
  },
];

/** Sample page the tour walks through, followed by the tour itself */
const page = (args: object) => `
  <div style="max-width: 640px; margin: 0 auto; padding: 40px 24px; display: grid; gap: 24px; font-family: var(--ui-font)">
    <section style="padding: 24px; border: 1px solid var(--ui-border); border-radius: var(--ui-radius-lg);
                    background: var(--ui-surface); box-shadow: var(--ui-shadow)">
      <h2 id="ob-title" style="margin: 0 0 8px; font-size: 22px">Onboarding example</h2>
      <p style="margin: 0 0 18px; color: var(--ui-text-muted)">
        Here is an example of a card with actions that should be explained to new users.
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 10px">
        <button id="ob-basic" type="button" class="ui-btn ui-btn--primary">Basic</button>
        <button id="ob-link" type="button" class="ui-btn">Link</button>
        <button id="ob-delete" type="button" class="ui-btn ui-btn--danger">Delete</button>
      </div>
    </section>
    <div id="ob-icons" style="display: flex; gap: 8px; justify-self: start">
      <button type="button" class="ui-btn ui-btn--icon" aria-label="Edit"><np-icon name="pencil" [size]="18" /></button>
      <button type="button" class="ui-btn ui-btn--icon" aria-label="Share"><np-icon name="share-2" [size]="18" /></button>
      <button type="button" class="ui-btn ui-btn--icon" aria-label="Delete"><np-icon name="trash-2" [size]="18" /></button>
    </div>
    <div id="ob-banner" style="padding: 28px 24px; border-radius: var(--ui-radius-lg); background: var(--ui-gradient);
                               color: #fff; font-size: 16px">
      Here we have text with a background
    </div>
    <button id="ob-restart" type="button" class="ui-btn" style="justify-self: center" (click)="tour.start()">
      <np-icon name="rotate-ccw" [size]="16" /> Restart onboarding
    </button>
  </div>
  <np-onboarding #tour ${argsToTemplate(args)} />
`;

/**
 * A guided tour for new users. `steps` point at elements with CSS selectors; the tooltip has Back / Next / Skip
 * (keyboard: → next, ← back, Esc skip). Restart it with `start()`, or set `autoStart` with a `storageKey` so it
 * only shows on a user's first visit. Pick a `mode` (spotlight, beacon, welcome) and a `theme`.
 */
const meta: Meta<OnboardingComponent> = {
  title: 'Onboarding/Tour',
  component: OnboardingComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [IconComponent] })],
  argTypes: {
    mode: { control: 'inline-radio', options: ONBOARDING_MODES },
    theme: { control: 'inline-radio', options: ONBOARDING_THEMES },
  },
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: '560px' } } },
  args: {
    steps,
    autoStart: true,
    finished: fn(),
    skipped: fn(),
    openChange: fn(),
    stepChange: fn(),
  },
  render: (args) => ({ props: args, template: page(args) }),
};

export default meta;
type Story = StoryObj<OnboardingComponent>;

/** Dims the page and glides a spotlight from element to element */
export const Spotlight: Story = {};

/** A pulsing hotspot marks each element; the page isn't dimmed and stays usable */
export const Beacon: Story = { args: { mode: 'beacon' } };

/** Centered intro slides with a large icon (or `image`); no targets needed */
export const Welcome: Story = {
  args: {
    mode: 'welcome',
    theme: 'light',
    doneLabel: "Let's go",
    steps: [
      {
        icon: 'sparkles',
        title: 'Welcome to NexPrime',
        text: 'A modern component library for Angular, React and Vue.',
      },
      {
        icon: 'palette',
        title: 'Make it yours',
        text: 'Theme colors, 2,000+ icons and 35 animations out of the box.',
      },
      {
        icon: 'rocket',
        title: 'Ship faster',
        text: 'Forms, charts, chat and more, ready to drop into your app.',
      },
    ],
  },
};

export const DarkTheme: Story = { args: { theme: 'dark' } };

export const GradientTheme: Story = { args: { theme: 'gradient', mode: 'beacon' } };

/** Frosted glass tooltip (backdrop blur) */
export const GlassTheme: Story = { args: { theme: 'glass' } };
