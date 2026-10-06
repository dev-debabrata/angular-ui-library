import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { LOTTIE_DIRECTIONS, LottieComponent } from './lottie.component';

/** Browse every animation on the "NexLottie" page in the sidebar */
const meta: Meta<LottieComponent> = {
  title: 'Components/Media/Lottie Player',
  component: LottieComponent,
  tags: ['autodocs'],
  argTypes: { direction: { control: 'select', options: LOTTIE_DIRECTIONS } },
  args: { src: 'lottie/heart.json', loaded: fn(), complete: fn(), loopComplete: fn() },
};

export default meta;
type Story = StoryObj<LottieComponent>;

export const Default: Story = {};

/** Plays only while the pointer is over it */
export const PlayOnHover: Story = { args: { src: 'lottie/orbit.json', hover: true } };

/** Plays once and stops on the last frame (emits `complete`) */
export const PlayOnce: Story = { args: { src: 'lottie/success.json', loop: false } };

export const Fast: Story = { args: { src: 'lottie/loader.json', speed: 2, size: '120px' } };

/** `controls` adds a player bar: play/pause, a scrubber and a speed toggle (0.5×, 1×, 2×) */
export const Controls: Story = { args: { src: 'lottie/astronaut.json', controls: true } };

/** `direction`: "reverse" plays backwards, "bounce" plays forward and back (emits `loopComplete` at each end) */
export const Bounce: Story = { args: { src: 'lottie/bounce.json', direction: 'bounce' } };
