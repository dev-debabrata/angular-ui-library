import type { Meta, StoryObj } from '@storybook/angular-vite';

/** Sidebar entry only: the Icons page (icon-gallery.component.ts) is in the Angular app, and manager.ts opens it there */
const meta: Meta = {
  title: 'Icons',
  render: () => ({ template: '' }),
};

export default meta;

/** Named like the title, so Storybook shows it as a single "Icons" page in the sidebar */
export const Icons: StoryObj = {};
