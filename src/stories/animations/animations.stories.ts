import type { Meta, StoryObj } from '@storybook/angular-vite';

/** Sidebar entry only: the Animations page (animation-gallery.component.ts) is in the Angular app, and manager.ts opens it there */
const meta: Meta = {
  title: 'Animations',
  render: () => ({ template: '' }),
};

export default meta;

/** Named like the title, so Storybook shows it as a single "Animations" page in the sidebar */
export const Animations: StoryObj = {};
