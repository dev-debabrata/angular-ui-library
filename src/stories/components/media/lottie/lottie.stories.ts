import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { LottieComponent } from './lottie.component';

/** Browse every animation on the "NexLottie" page in the sidebar */
const meta: Meta<LottieComponent> = {
  title: 'Components/Media/Lottie Player',
  component: LottieComponent,
  tags: ['autodocs'],
  args: { src: 'lottie/heart.json', size: '200px', loaded: fn(), complete: fn() },
};

export default meta;
type Story = StoryObj<LottieComponent>;

export const Default: Story = {};

/** Plays only while the pointer is over it */
export const PlayOnHover: Story = { args: { src: 'lottie/orbit.json', hover: true } };

/** Plays once and stops on the last frame (emits `complete`) */
export const PlayOnce: Story = { args: { src: 'lottie/success.json', loop: false } };

export const Fast: Story = { args: { src: 'lottie/loader.json', speed: 2, size: '120px' } };
