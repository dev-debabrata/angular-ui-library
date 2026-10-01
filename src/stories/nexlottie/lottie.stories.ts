import type { Meta, StoryObj } from '@storybook/angular-vite';

/** Sidebar entry only: the NexLottie page (lottie-gallery.component.ts) is in the Angular app, and manager.ts opens it there */
const meta: Meta = {
  title: 'NexLottie',
  render: () => ({ template: '' }),
};

export default meta;

/** Named like the title, so Storybook shows it as a single "NexLottie" page in the sidebar */
export const NexLottie: StoryObj = { name: 'NexLottie' };
